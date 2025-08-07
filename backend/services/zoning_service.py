import requests
import os
from typing import Dict, Optional, Any
import asyncio
import json

class ZoningService:
    def __init__(self):
        self.google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.base_zoning_rules = self._load_base_zoning_rules()
    
    def _load_base_zoning_rules(self) -> Dict[str, Any]:
        return {
            "residential": {
                "R-1": {
                    "max_height": 35,
                    "min_setback_front": 25,
                    "min_setback_rear": 25,
                    "min_setback_side": 8,
                    "max_lot_coverage": 0.35,
                    "allowed_structures": ["single_family", "garage", "shed", "deck"]
                },
                "R-2": {
                    "max_height": 30,
                    "min_setback_front": 20,
                    "min_setback_rear": 20,
                    "min_setback_side": 6,
                    "max_lot_coverage": 0.40,
                    "allowed_structures": ["single_family", "duplex", "garage", "shed", "deck"]
                },
                "R-3": {
                    "max_height": 45,
                    "min_setback_front": 15,
                    "min_setback_rear": 15,
                    "min_setback_side": 5,
                    "max_lot_coverage": 0.50,
                    "allowed_structures": ["multi_family", "garage", "deck"]
                }
            },
            "commercial": {
                "C-1": {
                    "max_height": 45,
                    "min_setback_front": 10,
                    "min_setback_rear": 10,
                    "min_setback_side": 5,
                    "max_lot_coverage": 0.70,
                    "allowed_structures": ["retail", "office", "restaurant"]
                },
                "C-2": {
                    "max_height": 60,
                    "min_setback_front": 5,
                    "min_setback_rear": 10,
                    "min_setback_side": 0,
                    "max_lot_coverage": 0.80,
                    "allowed_structures": ["retail", "office", "warehouse", "manufacturing"]
                }
            },
            "industrial": {
                "I-1": {
                    "max_height": 60,
                    "min_setback_front": 20,
                    "min_setback_rear": 20,
                    "min_setback_side": 10,
                    "max_lot_coverage": 0.60,
                    "allowed_structures": ["manufacturing", "warehouse", "office"]
                }
            }
        }
    
    async def get_zoning_info(self, address: Optional[str], parcel_id: Optional[str]) -> Dict[str, Any]:
        if not address and not parcel_id:
            return self._get_default_zoning_info()
        
        try:
            if address:
                coordinates = await self._geocode_address(address)
                if coordinates:
                    zoning_data = await self._lookup_zoning_by_coordinates(coordinates)
                    if zoning_data:
                        return zoning_data
            
            if parcel_id:
                zoning_data = await self._lookup_zoning_by_parcel(parcel_id)
                if zoning_data:
                    return zoning_data
        
        except Exception as e:
            print(f"Error fetching zoning info: {e}")
        
        return self._get_default_zoning_info()
    
    async def _geocode_address(self, address: str) -> Optional[Dict[str, float]]:
        if not self.google_maps_api_key:
            return None
        
        try:
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                "address": address,
                "key": self.google_maps_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                location = data["results"][0]["geometry"]["location"]
                return {
                    "lat": location["lat"],
                    "lng": location["lng"]
                }
        
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None
    
    async def _lookup_zoning_by_coordinates(self, coordinates: Dict[str, float]) -> Optional[Dict[str, Any]]:
        city_apis = {
            "madison_wi": "https://api.cityofmadison.com/zoning",
            "milwaukee_wi": "https://api.milwaukee.gov/zoning",
        }
        
        for city, api_url in city_apis.items():
            try:
                params = {
                    "lat": coordinates["lat"],
                    "lng": coordinates["lng"],
                    "format": "json"
                }
                
                response = requests.get(api_url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_zoning_api_response(data)
            
            except:
                continue
        
        return self._infer_zoning_from_coordinates(coordinates)
    
    async def _lookup_zoning_by_parcel(self, parcel_id: str) -> Optional[Dict[str, Any]]:
        return None
    
    def _parse_zoning_api_response(self, api_data: Dict) -> Dict[str, Any]:
        district = api_data.get("zoning_district", "R-2")
        classification = self._classify_zoning_district(district)
        
        zoning_rules = self._get_zoning_rules(classification, district)
        
        return {
            "district": district,
            "classification": classification,
            "source": "municipal_api",
            "rules": zoning_rules,
            "restrictions": self._generate_restriction_list(zoning_rules)
        }
    
    def _infer_zoning_from_coordinates(self, coordinates: Dict[str, float]) -> Dict[str, Any]:
        district = "R-2"
        classification = "residential"
        zoning_rules = self._get_zoning_rules(classification, district)
        
        return {
            "district": district,
            "classification": classification,
            "source": "inferred",
            "rules": zoning_rules,
            "restrictions": self._generate_restriction_list(zoning_rules)
        }
    
    def _get_default_zoning_info(self) -> Dict[str, Any]:
        district = "R-2"
        classification = "residential"
        zoning_rules = self._get_zoning_rules(classification, district)
        
        return {
            "district": district,
            "classification": classification,
            "source": "default",
            "rules": zoning_rules,
            "restrictions": self._generate_restriction_list(zoning_rules)
        }
    
    def _classify_zoning_district(self, district: str) -> str:
        district_upper = district.upper()
        if district_upper.startswith('R'):
            return "residential"
        elif district_upper.startswith('C'):
            return "commercial"
        elif district_upper.startswith('I'):
            return "industrial"
        else:
            return "residential"
    
    def _get_zoning_rules(self, classification: str, district: str) -> Dict[str, Any]:
        if classification in self.base_zoning_rules:
            if district in self.base_zoning_rules[classification]:
                return self.base_zoning_rules[classification][district]
            else:
                districts = list(self.base_zoning_rules[classification].keys())
                return self.base_zoning_rules[classification][districts[0]]
        
        return self.base_zoning_rules["residential"]["R-2"]
    
    def _generate_restriction_list(self, rules: Dict[str, Any]) -> list:
        restrictions = []
        
        if "max_height" in rules:
            restrictions.append(f"Maximum height: {rules['max_height']} feet")
        
        if "min_setback_front" in rules:
            restrictions.append(f"Front setback: minimum {rules['min_setback_front']} feet")
        
        if "min_setback_rear" in rules:
            restrictions.append(f"Rear setback: minimum {rules['min_setback_rear']} feet")
        
        if "min_setback_side" in rules:
            restrictions.append(f"Side setback: minimum {rules['min_setback_side']} feet")
        
        if "max_lot_coverage" in rules:
            coverage_percent = int(rules['max_lot_coverage'] * 100)
            restrictions.append(f"Maximum lot coverage: {coverage_percent}%")
        
        if "allowed_structures" in rules:
            structures = ", ".join(rules['allowed_structures'])
            restrictions.append(f"Allowed structures: {structures}")
        
        return restrictions