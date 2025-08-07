import os
import tempfile
import shutil
from fastapi import UploadFile
from typing import List

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 10 * 1024 * 1024

def validate_file(file: UploadFile) -> bool:
    if not file.filename:
        return False
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    if file.size and file.size > MAX_FILE_SIZE:
        return False
    
    return True

async def save_uploaded_file(file: UploadFile) -> str:
    file_extension = os.path.splitext(file.filename)[1].lower()
    temp_file = tempfile.NamedTemporaryFile(suffix=file_extension, delete=False)
    
    try:
        contents = await file.read()
        temp_file.write(contents)
        temp_file.close()
        return temp_file.name
    except Exception as e:
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise Exception(f"Failed to save uploaded file: {str(e)}")

def cleanup_temp_file(file_path: str):
    if os.path.exists(file_path):
        try:
            os.unlink(file_path)
        except:
            pass

def get_file_info(file_path: str) -> dict:
    if not os.path.exists(file_path):
        return {}
    
    stat = os.stat(file_path)
    _, extension = os.path.splitext(file_path)
    
    return {
        'size': stat.st_size,
        'extension': extension.lower(),
        'filename': os.path.basename(file_path)
    }