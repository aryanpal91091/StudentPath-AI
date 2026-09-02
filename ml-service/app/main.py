import os
import re
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="StudentPath AI ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "datasets")

# Load datasets safely
try:
    df_skills = pd.read_csv(os.path.join(DATASETS_DIR, "skills.csv"))
    df_careers = pd.read_csv(os.path.join(DATASETS_DIR, "careers.csv"))
    df_career_skills = pd.read_csv(os.path.join(DATASETS_DIR, "career_skills.csv"))
    df_opportunities = pd.read_csv(os.path.join(DATASETS_DIR, "opportunities.csv"))
    df_courses = pd.read_csv(os.path.join(DATASETS_DIR, "courses.csv"))
    df_exams = pd.read_csv(os.path.join(DATASETS_DIR, "exams.csv"))
    df_scholarships = pd.read_csv(os.path.join(DATASETS_DIR, "scholarships.csv"))
    print("All datasets loaded successfully in FastAPI ML Service.")
except Exception as e:
    print(f"Error loading datasets: {e}")
    # Initialize blank dataframes to prevent crash
    df_skills = pd.DataFrame(columns=["id", "skill", "category"])
    df_careers = pd.DataFrame(columns=["id", "career", "title", "description", "education", "interests", "subjects", "career_type"])
    df_career_skills = pd.DataFrame(columns=["career_id", "skill_id", "importance"])
    df_opportunities = pd.DataFrame(columns=["id", "title", "organization", "category", "description", "education", "min_year", "max_year", "branch", "skills", "location", "mode", "deadline", "prize", "stipend", "fee", "url", "source", "last_verified", "status"])
    df_courses = pd.DataFrame(columns=["id", "title", "provider", "career", "skills", "duration", "level"])
    df_exams = pd.DataFrame(columns=["id", "name", "conducting_body", "eligibility", "education", "branches", "application_start", "deadline", "official_url"])
    df_scholarships = pd.DataFrame(columns=["id", "name", "provider", "eligibility", "education", "category", "amount", "deadline", "official_url"])

class OpportunityReq(BaseModel):
    education: str
    branch: str
    year: int
    skills: str
    interests: str
    location: str
    mode: str

class CareerAssessmentReq(BaseModel):
    answers: Dict[str, Any]

class SkillGapReq(BaseModel):
    career_id: int
    student_skills: str

class RoadmapReq(BaseModel):
    career_id: int
    education: str

@app.get("/health")
def health():
    return {"status": "healthy", "datasets_loaded": not df_opportunities.empty}

@app.post("/recommend-opportunities")
def recommend_opportunities(req: OpportunityReq):
    if df_opportunities.empty:
        raise HTTPException(status_code=500, detail="Opportunities dataset is empty")

    # Clean input skills & interests
    user_skills = [s.strip().lower() for s in req.skills.split(",") if s.strip()]
    user_interests = [i.strip().lower() for i in req.interests.split(",") if i.strip()]

    recommendations = []

    # Filter opportunities by eligibility (Education & Year)
    # Define simple education hierarchy
    edu_rank = {"Class 10": 1, "Class 12": 2, "Diploma": 3, "Undergraduate": 4, "Postgraduate": 5, "Graduate": 6}
    user_rank = edu_rank.get(req.education, 4) # Default to undergrad

    # Filter loop
    for _, row in df_opportunities.iterrows():
        # Check active status
        if row["status"] not in ["ACTIVE", "CLOSING_SOON", "UPCOMING"]:
            continue

        # Check education eligibility
        opp_edu = str(row["education"]).split(",")
        is_edu_eligible = False
        for oe in opp_edu:
            oe_strip = oe.strip()
            # If opportunity matches or requires less rank
            if oe_strip in edu_rank and edu_rank[oe_strip] <= user_rank:
                is_edu_eligible = True
            elif req.education.lower() in oe_strip.lower():
                is_edu_eligible = True
        
        if not is_edu_eligible and row["education"] != "All Streams" and row["education"] != "All Branches":
            continue

        # Check branch eligibility
        opp_branch = str(row["branch"]).lower()
        user_branch = req.branch.lower()
        is_branch_eligible = (
            opp_branch == "all branches" or 
            opp_branch == "all streams" or 
            user_branch in opp_branch or 
            opp_branch in user_branch
        )
        if not is_branch_eligible:
            continue

        # Check year eligibility
        min_y = int(row["min_year"]) if not pd.isna(row["min_year"]) else 1
        max_y = int(row["max_year"]) if not pd.isna(row["max_year"]) else 5
        if not (min_y <= req.year <= max_y):
            continue

        # Scoring
        score = 65.0 # Base score

        # 1. Skill overlap score
        opp_skills = [s.strip().lower() for s in str(row["skills"]).split(",") if s.strip()]
        skill_intersection = set(user_skills).intersection(set(opp_skills))
        if opp_skills:
            skill_score = (len(skill_intersection) / len(opp_skills)) * 25.0
            score += skill_score
        
        # 2. Interest match score
        opp_category = str(row["category"]).lower()
        if opp_category in user_interests:
            score += 10.0
            
        # 3. Location/Mode preference score
        opp_mode = str(row["mode"]).upper()
        if opp_mode == req.mode.upper():
            score += 5.0
        if req.location.lower() in str(row["location"]).lower() or str(row["location"]).lower() == "remote":
            score += 5.0

        # Cap score at 98%
        match_pct = round(min(score, 98.0), 1)

        # Build reasoning explanation
        reason_list = []
        if skill_intersection:
            reason_list.append(f"matches your skills in: {', '.join(list(skill_intersection)[:3])}")
        if opp_category in user_interests:
            reason_list.append(f"aligns with your interest in {row['category']}")
        if opp_mode == req.mode.upper():
            reason_list.append(f"matches your preference for {opp_mode} opportunities")

        reason = "Recommended because it " + ", and it ".join(reason_list) + "." if reason_list else "Based on your academic profile and branch eligibility."

        recommendations.append({
            "id": int(row["id"]),
            "title": str(row["title"]),
            "organization": str(row["organization"]),
            "category": str(row["category"]),
            "education": str(row["education"]),
            "deadline": str(row["deadline"]) if not pd.isna(row["deadline"]) else None,
            "mode": str(row["mode"]),
            "location": str(row["location"]),
            "matchPercentage": match_pct,
            "reasoning": reason
        })

    # Sort recommendations
    recommendations = sorted(recommendations, key=lambda x: x["matchPercentage"], reverse=True)

    return {"recommendations": recommendations[:20]}

@app.post("/career-recommendation")
def career_recommendation(req: CareerAssessmentReq):
    if df_careers.empty:
        raise HTTPException(status_code=500, detail="Careers dataset is empty")

    answers = req.answers
    interests = " ".join(answers.get("interests", []))
    subjects = " ".join(answers.get("subjects", []))
    skills = " ".join(answers.get("skills", []))
    strengths = answers.get("strengths", "")
    goals = answers.get("goals", "")

    # Combine student answers to text representation
    student_profile_text = f"{interests} {subjects} {skills} {strengths} {goals}".lower()

    # Vectorize careers description, interests and subjects
    career_texts = []
    for _, row in df_careers.iterrows():
        c_text = f"{row['title']} {row['description']} {row['interests']} {row['subjects']}".lower()
        career_texts.append(c_text)

    # Calculate TF-IDF similarities
    vectorizer = TfidfVectorizer()
    all_texts = [student_profile_text] + career_texts
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Calculate cosine similarity between student (index 0) and all careers (index 1+)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

    recommendations = []
    for i, score in enumerate(similarities):
        row = df_careers.iloc[i]
        
        # Calculate final percentage (scale up basic cosine score)
        match_pct = round(min(50 + (score * 60), 96.0), 1)
        
        # Determine matching/missing skills
        career_id = int(row["id"])
        c_skills = df_career_skills[df_career_skills["career_id"] == career_id]
        
        matching_skills = []
        missing_skills = []
        
        student_skill_list = [s.strip().lower() for s in answers.get("skills", [])]
        
        for _, cs_row in c_skills.iterrows():
            skill_id = int(cs_row["skill_id"])
            skill_name_row = df_skills[df_skills["id"] == skill_id]
            if not skill_name_row.empty:
                s_name = str(skill_name_row.iloc[0]["skill"])
                if s_name.lower() in student_skill_list:
                    matching_skills.append(s_name)
                else:
                    missing_skills.append(s_name)

        recommendations.append({
            "careerId": career_id,
            "careerKey": str(row["career"]),
            "title": str(row["title"]),
            "description": str(row["description"]),
            "matchPercentage": match_pct,
            "reasoning": {
                "matchingSkills": matching_skills[:3],
                "missingSkills": missing_skills[:3],
                "rationale": f"Strong match because of your interest in {row['interests']} and affinity for {row['subjects']}.",
                "nextSteps": f"Focus on developing these key skills: {', '.join(missing_skills[:3])}."
            }
        })

    # Sort
    recommendations = sorted(recommendations, key=lambda x: x["matchPercentage"], reverse=True)
    return {"recommendations": recommendations[:5]}

@app.post("/skill-gap")
def skill_gap(req: SkillGapReq):
    career_id = req.career_id
    student_skills = [s.strip().lower() for s in req.student_skills.split(",") if s.strip()]

    career_row = df_careers[df_careers["id"] == career_id]
    if career_row.empty:
        raise HTTPException(status_code=404, detail="Career not found")

    career_title = career_row.iloc[0]["title"]
    c_skills = df_career_skills[df_career_skills["career_id"] == career_id]

    skills_have = []
    skills_need = []
    skill_list = []

    for _, row in c_skills.iterrows():
        s_id = int(row["skill_id"])
        importance = str(row["importance"])
        
        skill_name_row = df_skills[df_skills["id"] == s_id]
        if not skill_name_row.empty:
            s_name = str(skill_name_row.iloc[0]["skill"])
            
            has_it = s_name.lower() in student_skills
            if has_it:
                skills_have.append(s_name)
            else:
                skills_need.append(s_name)
                
            skill_list.append({
                "name": s_name,
                "importance": importance,
                "status": "HAVE" if has_it else "NEED"
            })

    # Priority sorting for missing skills: HIGH -> MEDIUM -> LOW
    priority_order = {"HIGH": 1, "MEDIUM": 2, "LOW": 3}
    sorted_needed = []
    for item in sorted(skill_list, key=lambda x: priority_order.get(x["importance"], 3)):
        if item["status"] == "NEED":
            sorted_needed.append(item["name"])

    return {
        "career": career_title,
        "skillsHave": skills_have,
        "skillsNeed": skills_need,
        "skillList": skill_list,
        "prioritySequence": sorted_needed
    }

@app.post("/career-roadmap")
def career_roadmap(req: RoadmapReq):
    career_id = req.career_id
    edu = req.education

    career_row = df_careers[df_careers["id"] == career_id]
    if career_row.empty:
        raise HTTPException(status_code=404, detail="Career not found")

    career_title = career_row.iloc[0]["title"]
    subjects = career_row.iloc[0]["subjects"]

    # Generate custom milestones based on target career and starting education
    steps = []
    
    if edu in ["Class 10", "Class 12"]:
        steps = [
            {
                "order": 1,
                "title": "Select Core Stream / Degree",
                "description": f"Choose Science/Commerce streams or enroll in B.Tech/BCA/B.Sc. Focus heavily on learning {subjects}."
            },
            {
                "order": 2,
                "title": "Learn Programming & Math Tools",
                "description": "Learn fundamental programming languages (Python/C++) and core engineering mathematics (Linear Algebra, Calculus)."
            },
            {
                "order": 3,
                "title": "Build Class/College Projects",
                "description": "Create 2-3 mini software or data analytics projects using public datasets on GitHub."
            },
            {
                "order": 4,
                "title": "Crack College Entrance / GATE exams",
                "description": "Prepare for competitive exams to secure admissions in IITs, NITs, or premium colleges."
            },
            {
                "order": 5,
                "title": "Apply for Corporate Internships",
                "description": f"Target entry-level summer internship positions matching {career_title} specifications."
            }
        ]
    else:
        steps = [
            {
                "order": 1,
                "title": "Master Core Domain Skills",
                "description": f"Focus on advanced courses in {subjects}. Get verified certifications from Coursera/NPTEL."
            },
            {
                "order": 2,
                "title": "Build a Portfolio & Open Source Contributions",
                "description": "Upload fully functional project repositories to GitHub. Contribute to open-source programs like GSoC."
            },
            {
                "order": 3,
                "title": "Participate in National Hackathons",
                "description": "Participate in hackathons (like Smart India Hackathon) and coding competitions (like TCS CodeVita) to test your skills."
            },
            {
                "order": 4,
                "title": "Seek Internships & Professional Mentorship",
                "description": f"Work as a junior intern in tech/corporate firms. Seek action plans from verified counsellors."
            },
            {
                "order": 5,
                "title": "Apply for Full-Time Roles",
                "description": f"Prepare for mock technical interviews, update LinkedIn profiles, and apply for full-time {career_title} jobs."
            }
        ]

    return {
        "career": career_title,
        "steps": steps
    }
