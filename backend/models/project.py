from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union

class Dimensions(BaseModel):
    length: Optional[Union[str, float]] = None
    width: Optional[Union[str, float]] = None
    height: Optional[Union[str, float]] = None

class Materials(BaseModel):
    exterior: Optional[str] = None
    roofing: Optional[str] = None
    foundation: Optional[str] = None

class ProjectData(BaseModel):
    description: str = Field(..., description="Detailed project description")
    address: Optional[str] = None
    parcel_id: Optional[str] = None
    structure_type: str = Field(default="garage", description="Type of structure being built")
    dimensions: Dimensions = Field(default_factory=Dimensions)
    location_on_lot: Optional[str] = None
    property_type: str = Field(default="residential", description="Property classification")
    materials: Materials = Field(default_factory=Materials)

class ZoningInfo(BaseModel):
    district: str
    classification: str
    restrictions: List[str] = Field(default_factory=list)

class FeasibilityResults(BaseModel):
    verdict: str = Field(..., description="Feasible, Needs Variance, or Not Feasible")
    confidence_score: Optional[int] = Field(None, ge=0, le=100)
    compliance_summary: str
    zoning_info: Optional[ZoningInfo] = None
    issues: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    required_permits: List[str] = Field(default_factory=list)

class ReviewIssue(BaseModel):
    category: Optional[str] = None
    description: str
    severity: Optional[str] = None

class ReviewFix(BaseModel):
    category: Optional[str] = None
    description: str
    priority: Optional[str] = None

class ReviewResults(BaseModel):
    rejection_risk: str = Field(..., description="Low, Medium, or High")
    confidence_score: Optional[int] = Field(None, ge=0, le=100)
    risk_summary: Optional[str] = None
    overall_assessment: Optional[str] = None
    issues: List[Union[ReviewIssue, str]] = Field(default_factory=list)
    fixes: List[Union[ReviewFix, str]] = Field(default_factory=list)
    missing_documents: List[str] = Field(default_factory=list)
    compliance_check: Dict[str, str] = Field(default_factory=dict)

class VisualRequest(BaseModel):
    structure_type: str
    dimensions: Dimensions
    materials: Optional[Materials] = None
    visual_type: str = Field(default="3d_rendering", description="Type of visual to generate")
    custom_prompt: Optional[str] = None
    address: Optional[str] = None
    location_on_lot: Optional[str] = None

class VisualResults(BaseModel):
    image_url: Optional[str] = None
    prompt_used: str
    visual_type: str
    status: str
    error: Optional[str] = None

class NarrativeResults(BaseModel):
    narrative: str
    word_count: int
    generated_at: str