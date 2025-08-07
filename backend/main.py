from dotenv import load_dotenv
import os

load_dotenv()

print(f"OpenAI API Key loaded: {os.getenv('OPENAI_API_KEY') is not None}")  # Debug line

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import tempfile
from typing import Optional, List, Dict, Any
import json

from services.ai_service import AIService
from services.document_service import DocumentService
from services.export_service import ExportService
from services.zoning_service import ZoningService
from models.project import ProjectData, FeasibilityResults, ReviewResults, VisualRequest
from utils.file_utils import validate_file, save_uploaded_file

app = FastAPI(title="PermitCheck AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()
document_service = DocumentService()
export_service = ExportService()
zoning_service = ZoningService()

@app.get("/")
async def root():
    return {"message": "PermitCheck AI API is running"}

@app.post("/api/feasibility-check")
async def check_feasibility(project_data: ProjectData) -> FeasibilityResults:
    try:
        zoning_info = await zoning_service.get_zoning_info(
            project_data.address, project_data.parcel_id
        )
        
        feasibility_result = await ai_service.analyze_feasibility(
            project_data, zoning_info
        )
        
        return feasibility_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feasibility check failed: {str(e)}")

@app.post("/api/generate-narrative")
async def generate_narrative(project_data: ProjectData):
    try:
        narrative = await ai_service.generate_construction_narrative(project_data)
        
        return {
            "narrative": narrative,
            "word_count": len(narrative.split()),
            "generated_at": "2024-01-01T00:00:00Z"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Narrative generation failed: {str(e)}")

@app.post("/api/review-permit")
async def review_permit(
    document: UploadFile = File(...),
    project_data: str = Form(...)
):
    try:
        project_info = json.loads(project_data)
        
        if not validate_file(document):
            raise HTTPException(status_code=400, detail="Invalid file type or size")
        
        temp_file_path = await save_uploaded_file(document)
        
        try:
            extracted_text = document_service.extract_text(temp_file_path)
            
            review_result = await ai_service.review_permit_application(
                extracted_text, project_info
            )
            
            return review_result
        
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid project data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document review failed: {str(e)}")

@app.post("/api/generate-visual")
async def generate_visual(visual_request: VisualRequest):
    try:
        visual_result = await ai_service.generate_visual(visual_request)
        return visual_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visual generation failed: {str(e)}")

@app.post("/api/export-document")
async def export_document(export_data: Dict[str, Any]):
    try:
        export_type = export_data.get("type", "pdf")
        
        if export_type not in ["pdf", "docx", "checklist"]:
            raise HTTPException(status_code=400, detail="Invalid export type")
        
        file_path = export_service.create_document(export_data, export_type)
        
        media_type = {
            "pdf": "application/pdf",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "checklist": "application/pdf"
        }[export_type]
        
        filename = f"permit-package.{export_type}"
        
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=filename,
            background=lambda: os.unlink(file_path) if os.path.exists(file_path) else None
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document export failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "ai_service": "online",
            "document_service": "online",
            "export_service": "online",
            "zoning_service": "online"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)