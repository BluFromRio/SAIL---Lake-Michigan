import openai
import os
import json
from typing import Dict, List, Any, Optional
import asyncio
from models.project import ProjectData, FeasibilityResults, ReviewResults, VisualRequest

class AIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o"
        self.dalle_model = "dall-e-3"
    
    async def analyze_feasibility(self, project_data: ProjectData, zoning_info: Dict) -> FeasibilityResults:
        prompt = f"""
        Analyze the feasibility of this construction project:
        
        Project: {project_data.description}
        Location: {project_data.address}
        Structure Type: {project_data.structure_type}
        Dimensions: {project_data.dimensions}
        Property Type: {project_data.property_type}
        
        Zoning Information: {json.dumps(zoning_info, indent=2)}
        
        Provide a detailed feasibility assessment with:
        1. Verdict: "Feasible", "Needs Variance", or "Not Feasible"
        2. Confidence score (0-100%)
        3. Detailed compliance summary explaining zoning and code requirements
        4. List of specific issues identified
        5. Recommendations for addressing issues
        6. Required permits list
        
        Format response as JSON matching this structure:
        {{
            "verdict": "string",
            "confidence_score": "number",
            "compliance_summary": "string",
            "zoning_info": {{"district": "string", "classification": "string", "restrictions": ["string"]}},
            "issues": ["string"],
            "recommendations": ["string"],
            "required_permits": ["string"]
        }}
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert construction permit analyst with deep knowledge of building codes and zoning regulations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        try:
            result = json.loads(response.choices[0].message.content)
            return FeasibilityResults(**result)
        except json.JSONDecodeError:
            return FeasibilityResults(
                verdict="Unknown",
                confidence_score=0,
                compliance_summary="Error processing feasibility analysis",
                issues=["Unable to parse AI response"],
                recommendations=["Please try again with more specific project details"],
                required_permits=[]
            )
    
    async def generate_construction_narrative(self, project_data: ProjectData) -> str:
        materials_text = f"exterior: {project_data.materials.get('exterior', 'TBD')}, roofing: {project_data.materials.get('roofing', 'TBD')}, foundation: {project_data.materials.get('foundation', 'TBD')}"
        
        prompt = f"""
        Generate a comprehensive construction narrative/scope of work for this project:
        
        Project: {project_data.description}
        Structure Type: {project_data.structure_type}
        Dimensions: {project_data.dimensions.get('length', 'TBD')}' x {project_data.dimensions.get('width', 'TBD')}' x {project_data.dimensions.get('height', 'TBD')}'
        Materials: {materials_text}
        Location on lot: {project_data.location_on_lot}
        
        Create a detailed, professional narrative that includes:
        1. Project overview and purpose
        2. Detailed construction specifications
        3. Materials and methods
        4. Foundation and structural details
        5. Electrical, plumbing, and mechanical systems (if applicable)
        6. Exterior finishes and roofing
        7. Site work and drainage considerations
        8. Compliance with applicable codes
        
        Write in professional permit application language, approximately 300-500 words.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert construction project writer who creates detailed, code-compliant construction narratives for permit applications."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4
        )
        
        return response.choices[0].message.content
    
    async def review_permit_application(self, document_text: str, project_info: Dict) -> ReviewResults:
        prompt = f"""
        Review this permit application document for completeness and compliance:
        
        Project Information: {json.dumps(project_info, indent=2)}
        
        Document Content:
        {document_text[:4000]}...
        
        Analyze the document for:
        1. Missing required fields, signatures, or attachments
        2. Zoning and building code compliance issues
        3. Inconsistent or vague project descriptions
        4. Formatting and documentation standard violations
        5. Overall rejection risk assessment
        
        Provide specific, actionable feedback with:
        - Rejection risk: "Low", "Medium", or "High"
        - Detailed list of issues found
        - Specific recommendations to fix each issue
        - Missing documents checklist
        - Compliance status for key categories
        
        Format as JSON:
        {{
            "rejection_risk": "string",
            "confidence_score": "number",
            "risk_summary": "string",
            "overall_assessment": "string",
            "issues": [
                {{"category": "string", "description": "string", "severity": "string"}}
            ],
            "fixes": [
                {{"category": "string", "description": "string", "priority": "string"}}
            ],
            "missing_documents": ["string"],
            "compliance_check": {{
                "signatures": "Pass/Fail/Warning",
                "site_plan": "Pass/Fail/Warning",
                "zoning_compliance": "Pass/Fail/Warning",
                "structural_details": "Pass/Fail/Warning",
                "narrative_completeness": "Pass/Fail/Warning"
            }}
        }}
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an experienced permit reviewer who evaluates construction permit applications for municipalities. You identify issues that commonly lead to rejections."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        try:
            result = json.loads(response.choices[0].message.content)
            return ReviewResults(**result)
        except json.JSONDecodeError:
            return ReviewResults(
                rejection_risk="High",
                confidence_score=0,
                risk_summary="Error processing document review",
                overall_assessment="Unable to analyze document due to processing error",
                issues=[{"category": "System Error", "description": "Document could not be properly analyzed", "severity": "Critical"}],
                fixes=[{"category": "System", "description": "Please re-upload the document or try with a different file format", "priority": "High"}],
                missing_documents=[],
                compliance_check={}
            )
    
    async def generate_visual(self, visual_request: VisualRequest) -> Dict[str, Any]:
        visual_type_prompts = {
            "3d_rendering": "Create a realistic 3D architectural rendering showing",
            "site_plan": "Create a top-down site plan diagram showing the layout of",
            "elevation": "Create an architectural elevation view showing the side profile of",
            "floor_plan": "Create a detailed floor plan showing the interior layout of"
        }
        
        base_prompt = visual_type_prompts.get(visual_request.visual_type, "Create a diagram of")
        
        project_details = f"{visual_request.structure_type} measuring {visual_request.dimensions.get('length', 24)} by {visual_request.dimensions.get('width', 30)} feet"
        
        if visual_request.materials:
            materials_text = f" with {visual_request.materials.get('exterior', 'standard')} exterior and {visual_request.materials.get('roofing', 'asphalt shingle')} roofing"
            project_details += materials_text
        
        custom_additions = f". {visual_request.custom_prompt}" if visual_request.custom_prompt else ""
        
        full_prompt = f"{base_prompt} {project_details}{custom_additions}. Architectural style, clean lines, professional presentation suitable for permit documentation."
        
        try:
            response = await self.client.images.generate(
                model=self.dalle_model,
                prompt=full_prompt[:1000],
                size="1024x1024",
                quality="standard",
                n=1
            )
            
            return {
                "image_url": response.data[0].url,
                "prompt_used": full_prompt,
                "visual_type": visual_request.visual_type,
                "status": "success"
            }
            
        except Exception as e:
            return {
                "image_url": None,
                "error": f"Failed to generate visual: {str(e)}",
                "prompt_used": full_prompt,
                "visual_type": visual_request.visual_type,
                "status": "error"
            }