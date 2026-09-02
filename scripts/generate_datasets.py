import os
import csv
import random
from datetime import datetime, timedelta

def main():
    print("Initializing dataset generation...")
    os.makedirs("datasets", exist_ok=True)
    os.makedirs("scripts", exist_ok=True)

    # 1. Generate Skills
    skills = []
    skill_categories = {
        "Programming": ["Python", "Java", "C++", "JavaScript", "TypeScript", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "SQL", "HTML", "CSS"],
        "Data & AI": ["Data Structures", "Algorithms", "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Statistics", "Data Analytics", "SQL", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Big Data", "Data Visualization"],
        "Web & Cloud": ["React", "Angular", "Vue.js", "Node.js", "Express", "Django", "FastAPI", "Spring Boot", "AWS", "Google Cloud", "Docker", "Kubernetes", "Git", "REST APIs", "GraphQL"],
        "Design": ["UI/UX Design", "Figma", "Adobe Illustrator", "Photoshop", "Graphic Design", "3D Modeling", "Video Editing", "Wireframing", "Prototyping"],
        "Business & Management": ["Product Management", "Business Analysis", "Financial Accounting", "Marketing", "SEO", "Sales", "Project Management", "Agile", "Scrum", "Business Strategy", "Economics"],
        "Soft Skills": ["Communication", "Leadership", "Public Speaking", "Technical Writing", "Creative Writing", "Problem Solving", "Time Management", "Critical Thinking", "Teamwork", "Negotiation"],
        "Science & Research": ["Research Methodology", "Academic Writing", "Biotechnology", "Bioinformatics", "Physics Lab", "Chemistry Lab", "Mathematics", "Calculus", "Linear Algebra"]
    }
    
    skill_id = 1
    skill_list_raw = []
    for category, items in skill_categories.items():
        for item in items:
            skill_list_raw.append({"id": skill_id, "skill": item, "category": category})
            skill_id += 1
            
    with open("datasets/skills.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "skill", "category"])
        for s in skill_list_raw:
            writer.writerow([s["id"], s["skill"], s["category"]])
    print(f"Generated {len(skill_list_raw)} skills.")

    # 2. Generate Careers
    careers = [
        {"id": 1, "career": "software_engineer", "title": "Software Engineer", "description": "Design, develop, and maintain software systems and applications.", "education": "B.Tech CSE/ECE, BCA, MCA, BSC CS", "interests": "Technology,Engineering", "subjects": "Computer Science,Mathematics", "career_type": "Tech"},
        {"id": 2, "career": "ai_ml_engineer", "title": "AI/ML Engineer", "description": "Build, train, and deploy machine learning and deep learning models to solve complex problems.", "education": "B.Tech CSE, M.Tech AI/ML, BCA/MCA with specialization", "interests": "Technology,AI/ML,Research", "subjects": "Computer Science,Statistics,Calculus,Linear Algebra", "career_type": "Tech"},
        {"id": 3, "career": "data_analyst", "title": "Data Analyst", "description": "Collect, process, and perform statistical analyses on large datasets to help businesses make decisions.", "education": "B.Sc Statistics, BCA, B.Tech, B.Com (Analytics)", "interests": "Business,Technology,Finance", "subjects": "Statistics,Economics,Computer Science", "career_type": "Tech"},
        {"id": 4, "career": "product_manager", "title": "Product Manager", "description": "Guide the development and success of a product from conception through launch and iteration.", "education": "MBA, B.Tech + Business experience, BBA", "interests": "Business,Technology,Management", "subjects": "Management,Economics,Communication", "career_type": "Management"},
        {"id": 5, "career": "cybersecurity_analyst", "title": "Cybersecurity Analyst", "description": "Protect an organization's computer networks and systems from security breaches and cyber attacks.", "education": "B.Tech CSE, B.Sc Cyber Security, MCA", "interests": "Technology,Defence", "subjects": "Computer Science,Networking,Information Security", "career_type": "Tech"},
        {"id": 6, "career": "ui_ux_designer", "title": "UI/UX Designer", "description": "Create intuitive, user-friendly, and visually appealing digital interfaces for applications and websites.", "education": "B.Des, B.Tech, BCA, Fine Arts", "interests": "Design,Technology", "subjects": "Design,Psychology,HTML/CSS", "career_type": "Design"},
        {"id": 7, "career": "chartered_accountant", "title": "Chartered Accountant", "description": "Manage financial audits, taxation, budgeting, and corporate finance consultancy for businesses.", "education": "CA, B.Com, M.Com", "interests": "Finance,Business", "subjects": "Accounting,Taxation,Finance,Economics", "career_type": "Finance"},
        {"id": 8, "career": "civil_servant", "title": "Civil Servant (IAS/IPS)", "description": "Implement government policies, maintain law and order, and oversee district and state administrations in India.", "education": "Any Bachelor's Degree (UPSC CSE qualified)", "interests": "Government Jobs,Social Impact,Defence", "subjects": "History,Polity,Geography,Economics,General Studies", "career_type": "Government"},
        {"id": 9, "career": "management_consultant", "title": "Management Consultant", "description": "Help organizations improve their performance by analyzing problems and proposing strategy recommendations.", "education": "MBA from top institutes, B.Tech, B.Com", "interests": "Business,Management,Finance", "subjects": "Management,Business Strategy,Communication", "career_type": "Management"},
        {"id": 10, "career": "biotechnology_researcher", "title": "Biotechnology Researcher", "description": "Conduct laboratory research to develop biological products, medicines, and agricultural innovations.", "education": "B.Tech Biotech, B.Sc Biotech, M.Sc, Ph.D", "interests": "Medicine,Research,Engineering", "subjects": "Biology,Chemistry,Biotechnology", "career_type": "Science"},
        {"id": 11, "career": "cloud_architect", "title": "Cloud Architect", "description": "Design and manage an organization's cloud computing strategy, including adoption, application design, and management.", "education": "B.Tech CSE, BCA, MCA", "interests": "Technology", "subjects": "Computer Science,Networking,Cloud Computing", "career_type": "Tech"},
        {"id": 12, "career": "devops_engineer", "title": "DevOps Engineer", "description": "Bridge the gap between software development and IT operations to automate and streamline deployments.", "education": "B.Tech CSE, BCA, MCA", "interests": "Technology", "subjects": "Computer Science,Systems Programming", "career_type": "Tech"},
        {"id": 13, "career": "investment_banker", "title": "Investment Banker", "description": "Help corporations, governments, and other entities raise capital and make strategic financial moves like M&A.", "education": "MBA Finance, Chartered Accountant, B.Com", "interests": "Finance,Business", "subjects": "Corporate Finance,Valuation,Accounting,Economics", "career_type": "Finance"},
        {"id": 14, "career": "marketing_manager", "title": "Marketing Manager", "description": "Plan, direct, and coordinate marketing efforts to promote products and services.", "education": "MBA Marketing, BBA, B.Com", "interests": "Business,Media", "subjects": "Marketing,Communication,Economics", "career_type": "Management"},
        {"id": 15, "career": "corporate_lawyer", "title": "Corporate Lawyer", "description": "Advise businesses on their legal rights, responsibilities, and transactions, including contracts and compliance.", "education": "BA LLB, B.Com LLB, LLM", "interests": "Law,Business", "subjects": "Law,Legal Writing,Constitutional Law", "career_type": "Law"},
        {"id": 16, "career": "defense_officer", "title": "Defense Officer (Army/Navy/Air Force)", "description": "Serve in the armed forces, leading operations, maintaining territorial integrity, and managing national security.", "education": "B.Tech, B.Sc, B.A (NDA/CDS/AFCAT qualified)", "interests": "Defence,Government Jobs,Social Impact", "subjects": "General Studies,Physics,Mathematics,Leadership", "career_type": "Government"},
        {"id": 17, "career": "entrepreneur", "title": "Entrepreneur", "description": "Start, build, and run new business ventures, managing financial risk for commercial success.", "education": "Any Degree", "interests": "Entrepreneurship,Business,Technology", "subjects": "Business Strategy,Finance,Leadership", "career_type": "Business"},
        {"id": 18, "career": "research_scientist", "title": "Research Scientist", "description": "Conduct basic or applied scientific research to advance knowledge in physical, chemical, or mathematical sciences.", "education": "B.Sc, M.Sc, Ph.D", "interests": "Research,AI/ML", "subjects": "Physics,Chemistry,Mathematics,Research Methodology", "career_type": "Science"},
        {"id": 19, "career": "public_relations_specialist", "title": "Public Relations Specialist", "description": "Manage the public image, media relations, and communications for organizations and individuals.", "education": "BJMC, BA English, MBA", "interests": "Media,Business", "subjects": "Communication,Journalism,Public Relations", "career_type": "Media"},
        {"id": 20, "career": "data_engineer", "title": "Data Engineer", "description": "Build systems and pipelines that compile and analyze raw, unstructured data for data science use.", "education": "B.Tech CSE, BCA, MCA", "interests": "Technology", "subjects": "Computer Science,Database Systems", "career_type": "Tech"}
    ]
    
    # Let's expand careers up to 100 with variations
    expanded_careers = []
    career_names_extended = [
        ("Frontend Developer", "Web & Cloud", "Develop client-side web applications using React, HTML, CSS, JavaScript.", "B.Tech CSE, BCA, B.Sc CS", "Technology,Design", "Computer Science,HTML/CSS"),
        ("Backend Developer", "Web & Cloud", "Develop server-side systems, databases, and APIs using Node.js, Python, Java.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,Database Systems"),
        ("Full Stack Developer", "Web & Cloud", "Build both front-end and back-end parts of web applications.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,HTML/CSS,Database Systems"),
        ("Mobile App Developer", "Web & Cloud", "Develop applications for iOS and Android devices.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,Mobile Programming"),
        ("Database Administrator", "Data & AI", "Manage, secure, and maintain relational and non-relational database systems.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,Database Systems"),
        ("Game Developer", "Technology", "Design, model, and code interactive 2D and 3D computer and mobile games.", "B.Tech CSE, BCA, B.Des", "Technology,Design", "Computer Science,3D Modeling"),
        ("QA Automation Engineer", "Technology", "Write automated tests to verify the quality and correctness of software.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,Testing"),
        ("Network Security Engineer", "Technology", "Design, implement, and support secure computer networking infrastructure.", "B.Tech CSE, BCA, MCA", "Technology,Defence", "Computer Science,Networking"),
        ("Cloud DevOps Architect", "Web & Cloud", "Provide architectural leadership for cloud deployments and automation.", "B.Tech CSE, MCA", "Technology", "Computer Science,Cloud Computing"),
        ("Systems Administrator", "Technology", "Install, configure, and maintain computer systems and servers.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,Systems Programming"),
        ("VLSI Design Engineer", "Engineering", "Design integrated circuits and microchips for hardware platforms.", "B.Tech ECE, M.Tech VLSI", "Engineering,Technology", "Electronics,Physics,Mathematics"),
        ("Embedded Systems Engineer", "Engineering", "Develop hardware-software systems like microcontrollers and IoT devices.", "B.Tech ECE/EEE, BCA", "Engineering,Technology", "Electronics,Computer Science"),
        ("Aerospace Engineer", "Engineering", "Design, test, and manufacture aircraft, spacecraft, satellites, and missiles.", "B.Tech Aerospace/Mechanical", "Engineering,Defence,Research", "Physics,Mathematics,Aerodynamics"),
        ("Mechanical Design Engineer", "Engineering", "Design mechanical components and systems using CAD tools.", "B.Tech Mechanical", "Engineering", "Physics,Mathematics,CAD"),
        ("Civil Site Engineer", "Engineering", "Oversee and manage construction projects like buildings, roads, and bridges.", "B.Tech Civil, Diploma Civil", "Engineering", "Physics,Civil Engineering"),
        ("Chemical Engineer", "Engineering", "Design chemical plants and processes for manufacturing chemicals and fuels.", "B.Tech Chemical", "Engineering,Research", "Chemistry,Mathematics,Chemical Processes"),
        ("Financial Risk Analyst", "Finance", "Identify and analyze potential financial risks facing an organization.", "B.Com, B.Sc Math/Stats, MBA", "Finance,Business", "Statistics,Finance,Economics"),
        ("Stock Trader / Portfolio Manager", "Finance", "Analyze stock markets and invest in financial assets for returns.", "B.Com, BBA, B.Sc Math", "Finance,Business", "Economics,Finance,Statistics"),
        ("Tax Consultant", "Finance", "Advise individuals and corporations on tax planning and legal compliance.", "B.Com, CA, LLB", "Finance,Business,Law", "Taxation,Accounting,Law"),
        ("Human Resource Manager", "Management", "Manage employee recruitment, relations, training, and company culture.", "MBA HR, BBA, B.Com", "Business,Management", "Management,Communication,Psychology"),
        ("Operations Manager", "Management", "Design, manage, and optimize business operations and supply chains.", "MBA Operations, B.Tech, BBA", "Business,Management", "Management,Operations Research"),
        ("SEO & Content Writer", "Media", "Write engaging web content optimized for search engines and readers.", "BA English, BJMC, Any Degree", "Media,Writing", "English,Communication,Marketing"),
        ("Journalist & Media Reporter", "Media", "Investigate and report news stories for TV, print, or digital media.", "BJMC, BA Journalism", "Media,Writing", "Journalism,Communication,Political Science"),
        ("3D Animator & Visual Artist", "Design", "Create 3D animations, special effects, and visual graphics.", "B.Des, B.Sc Animation, Fine Arts", "Design,Media", "Design,3D Modeling"),
        ("Patent Attorney", "Law", "Advise clients on intellectual property rights, patents, and trademarks.", "B.Tech + LLB, LLM", "Law,Business,Technology", "Law,Patent Law,Technical Writing"),
        ("Criminal Defense Lawyer", "Law", "Represent clients charged with criminal offenses in judicial courts.", "BA LLB, LLB, LLM", "Law", "Law,Criminal Law,Public Speaking"),
        ("High School Physics Teacher", "Education", "Teach physics concepts to high school and senior secondary students.", "B.Sc + B.Ed, M.Sc", "Education,Research", "Physics,Mathematics,Education"),
        ("College Professor (Computer Science)", "Education", "Conduct lectures, guide research, and teach university students.", "Ph.D CS, M.Tech, MCA + NET", "Education,Research,Technology", "Computer Science,Research Methodology"),
        ("Clinical Psychologist", "Medicine", "Diagnose and treat mental, emotional, and behavioral disorders.", "BA/B.Sc Psychology, M.Sc, M.Phil", "Medicine,Social Impact", "Psychology,Biology,Communication"),
        ("Clinical Research Associate", "Science", "Coordinate and monitor clinical trials for new drugs and treatments.", "B.Pharm, B.Sc Biotech, M.Sc", "Medicine,Research", "Biology,Chemistry,Clinical Trials"),
        ("Pharmacist", "Medicine", "Dispense medications and advise patients and doctors on drug usage.", "B.Pharm, D.Pharm", "Medicine,Business", "Chemistry,Biology,Pharmacology"),
        ("General Medical Practitioner", "Medicine", "Diagnose, treat, and manage general health conditions of patients.", "MBBS", "Medicine", "Biology,Chemistry,Medicine"),
        ("Agricultural Officer", "Government", "Advise farmers and monitor rural agricultural schemes for government.", "B.Sc Agriculture", "Government Jobs,Social Impact", "Agriculture,Biology,Economics"),
        ("Food Technologist", "Science", "Examine food production, packaging, and safety standards.", "B.Tech Food Tech, B.Sc Food Sci", "Science,Research", "Chemistry,Biology,Food Science"),
        ("Environmental Consultant", "Science", "Advise businesses and government on pollution, waste, and green policies.", "B.Sc/B.Tech Environmental Sci", "Science,Social Impact", "Biology,Chemistry,Environmental Law"),
        ("Social Worker (NGO Manager)", "Social Impact", "Manage community welfare projects and assist vulnerable populations.", "MSW, BSW, Any Degree", "Social Impact", "Sociology,Communication,Social Work"),
        ("Public Policy Analyst", "Social Impact", "Evaluate government laws and policies, writing impact briefs.", "MA Public Policy, BA, B.Sc", "Social Impact,Government Jobs", "Polity,Economics,Sociology"),
        ("Data Scientist", "Data & AI", "Apply machine learning and statistics to extract insights from data.", "B.Tech CSE, M.Sc Stats, BCA", "Technology,AI/ML,Research", "Computer Science,Statistics,Linear Algebra"),
        ("Cybersecurity Consultant", "Technology", "Provide strategic cyber threat assessments for businesses.", "B.Tech CSE, BCA, MCA", "Technology,Defence", "Computer Science,Information Security"),
        ("Enterprise Risk Consultant", "Business", "Analyze operational and strategic risks in large corporations.", "B.Com, BBA, MBA", "Business,Management", "Management,Economics,Finance"),
        ("User Experience Researcher", "Design", "Perform user interviews and study usability to improve products.", "B.Des, BA Psychology, BCA", "Design,Research", "Design,Psychology,Communication"),
        ("Solutions Architect", "Web & Cloud", "Translate business requirements into scalable technology designs.", "B.Tech, MCA", "Technology,Business", "Computer Science,Systems Architecture"),
        ("Robotics Software Engineer", "Engineering", "Write control software, path planning, and computer vision for robots.", "B.Tech CSE/ECE/Robotics", "Engineering,Technology,AI/ML", "Computer Science,Mathematics,Physics"),
        ("Biomedical Instrumentation Engineer", "Engineering", "Design and maintain medical imaging and diagnostic equipment.", "B.Tech Biomedical/ECE", "Engineering,Medicine", "Electronics,Biology,Physics"),
        ("Actuarial Analyst", "Finance", "Use mathematical modeling to assess risk in insurance and finance.", "B.Sc Actuarial, B.Sc Maths", "Finance,Business", "Mathematics,Statistics,Finance"),
        ("Financial Consultant", "Finance", "Help individuals plan taxes, investments, and retirement savings.", "B.Com, BBA, MBA", "Finance,Business", "Finance,Taxation,Economics"),
        ("Supply Chain Analyst", "Management", "Optimize logistical flows from raw materials to final customer delivery.", "B.Tech, BBA, MBA", "Business,Management", "Operations Research,Management"),
        ("Brand Strategist", "Business", "Develop positioning and creative concepts for consumer brands.", "BBA, MBA Marketing, BJMC", "Business,Media", "Marketing,Communication,Psychology"),
        ("Media Planner", "Media", "Determine the best channels and budgets for media campaigns.", "BBA, BJMC, B.Com", "Media,Business", "Marketing,Statistics,Communication"),
        ("Technical Product Owner", "Management", "Bridge business requirements and developer backlogs in agile teams.", "B.Tech, BCA + Agile cert", "Business,Technology,Management", "Computer Science,Management,Scrum"),
        ("Creative Director", "Design", "Lead design, styling, and visual identity for advertising agency.", "B.Des, Fine Arts", "Design,Media", "Design,Graphic Design,Communication"),
        ("IP Litigation Specialist", "Law", "Represent technology and media firms in IP disputes.", "LLB, LLM", "Law,Business", "Law,Patent Law,Public Speaking"),
        ("Public Prosecutor", "Law", "State-appointed lawyer prosecuting criminal cases on behalf of state.", "LLB (qualified Bar exam)", "Law,Government Jobs", "Law,Criminal Law,Polity"),
        ("Special Education Teacher", "Education", "Teach and assist children with learning or physical disabilities.", "B.Ed Special Ed, BA", "Education,Social Impact", "Psychology,Education,Communication"),
        ("Data Visualization Specialist", "Data & AI", "Create reports and dashboard visualizations for business intelligence.", "B.Sc CS, BCA, B.Com", "Technology,Business", "Data Visualization,SQL,Statistics"),
        ("SRE Engineer", "Web & Cloud", "Maintain uptime and reliability of distributed web systems.", "B.Tech CSE, BCA, MCA", "Technology", "Computer Science,Networking,Docker"),
        ("VLSI Verification Engineer", "Engineering", "Write testbenches to verify microchip designs before manufacturing.", "B.Tech ECE, M.Tech VLSI", "Engineering,Technology", "Electronics,Digital Logic,C++"),
        ("Embedded Firmware Developer", "Engineering", "Write low-level code directly running on silicon microcontrollers.", "B.Tech ECE/CSE", "Engineering,Technology", "Electronics,C++,Computer Science"),
        ("IoT Systems Architect", "Engineering", "Design connected device networks connecting hardware sensors to cloud.", "B.Tech ECE/CSE, MCA", "Engineering,Technology", "Computer Science,Electronics,Cloud Computing"),
        ("Aerodynamics Analyst", "Engineering", "Run fluid dynamic simulations on vehicle and turbine bodies.", "B.Tech Aerospace/Mech, M.Tech", "Engineering,Research", "Physics,Mathematics,Calculus"),
        ("Structural Design Engineer", "Engineering", "Evaluate load capabilities of columns and beams for high-rises.", "B.Tech Civil, M.Tech Structural", "Engineering", "Physics,Civil Engineering,CAD"),
        ("Chemical Process Safety Specialist", "Engineering", "Monitor safety thresholds in high-temperature chemical reactions.", "B.Tech Chemical", "Engineering", "Chemistry,Chemical Processes"),
        ("Quantitative Finance Analyst", "Finance", "Design mathematical pricing algorithms for derivative trading.", "B.Sc Maths/Stats, M.Sc Finance", "Finance,Business,Research", "Mathematics,Statistics,Finance"),
        ("Arbitrage Trader", "Finance", "Execute rapid trades exploiting price gaps across exchanges.", "B.Com, B.Sc Maths", "Finance,Business", "Finance,Economics,Mathematics"),
        ("Corporate Treasury Analyst", "Finance", "Manage cash flows, forex reserves, and corporate debt accounts.", "B.Com, MBA Finance", "Finance,Business", "Finance,Accounting,Economics"),
        ("HR Recruitment Specialist", "Management", "Source, interview, and match candidates to open client vacancies.", "MBA HR, BBA", "Business,Management", "Management,Communication,Psychology"),
        ("Digital Marketing Specialist", "Business", "Manage search and paid social advertising budgets for brands.", "BBA, BJMC, Any Degree", "Business,Media", "Marketing,Communication,SEO"),
        ("News Editor", "Media", "Review and refine copy written by reporters before publication.", "BJMC, BA English", "Media,Writing", "English,Journalism,Communication"),
        ("Illustrator & Concept Artist", "Design", "Sketch storyboards and vector illustrations for publishing.", "B.Des, Fine Arts", "Design,Media", "Design,Graphic Design"),
        ("Regulatory Affairs Specialist", "Science", "Ensure medical trials and pharmaceutical filings meet government rules.", "B.Pharm, B.Sc, M.Sc", "Medicine,Research", "Biology,Chemistry,Environmental Law"),
        ("Bioinformatics Analyst", "Science", "Analyze DNA sequencing datasets using computing algorithms.", "B.Sc Bioinfo, B.Tech CSE", "Science,Research,Technology", "Biology,Computer Science,Statistics"),
        ("Organic Chemist", "Science", "Synthesize chemical compounds for drugs in clinical labs.", "B.Sc, M.Sc Chemistry", "Science,Research", "Chemistry,Chemistry Lab"),
        ("Academic Counsellor", "Education", "Assist school students in choosing streams and higher studies.", "BA Psychology, B.Ed, Any Degree", "Education,Social Impact", "Psychology,Communication,Social Work"),
        ("Disaster Relief Coordinator", "Social Impact", "Manage emergency distribution and aid logistics in disaster zones.", "BSW, MSW, Any Degree", "Social Impact,Government Jobs", "Social Work,Leadership,Communication"),
        ("Urban Policy Researcher", "Social Impact", "Collect socioeconomic metrics to draft public housing policies.", "MA Sociology, BA Econ", "Social Impact,Research", "Sociology,Economics,Polity"),
        ("Corporate Social Responsibility Lead", "Social Impact", "Direct corporate donation budgets to verified community NGOs.", "MSW, MBA Social Enterprise", "Social Impact,Business", "Social Work,Management,Communication"),
        ("System Security Architect", "Technology", "Design overarching security boundaries for IT networks.", "B.Tech CSE, MCA", "Technology,Defence", "Computer Science,Information Security,Networking"),
        ("E-commerce Category Manager", "Management", "Select inventory, set pricing, and manage vendors for online stores.", "BBA, MBA", "Business,Management", "Management,Economics,Marketing"),
        ("Speech & Language Therapist", "Medicine", "Treat speech impairments in children and stroke survivors.", "B.ASLP", "Medicine,Social Impact", "Biology,Psychology,Communication"),
        ("Horticulturist", "Science", "Improve yield and quality of fruits, vegetables, and ornamental plants.", "B.Sc Horticulture", "Science,Social Impact", "Agriculture,Biology")
    ]
    
    for i, (title, category, desc, edu, interests, subs) in enumerate(career_names_extended):
        careers.append({
            "id": len(careers) + 1,
            "career": title.lower().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "").replace("/", "_"),
            "title": title,
            "description": desc,
            "education": edu,
            "interests": interests,
            "subjects": subs,
            "career_type": category
        })
        
    with open("datasets/careers.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "career", "title", "description", "education", "interests", "subjects", "career_type"])
        for c in careers:
            writer.writerow([c["id"], c["career"], c["title"], c["description"], c["education"], c["interests"], c["subjects"], c["career_type"]])
    print(f"Generated {len(careers)} careers.")

    # 3. Generate Career Skills mapping
    career_skills = []
    for c in careers:
        mapped_count = 0
        desc_lower = c["description"].lower() + " " + c["subjects"].lower()
        
        for s in skill_list_raw:
            skill_lower = s["skill"].lower()
            importance = "LOW"
            
            is_match = False
            if skill_lower in desc_lower:
                is_match = True
                importance = "HIGH"
            elif s["category"] == "Soft Skills" and random.random() < 0.25:
                is_match = True
                importance = "MEDIUM"
            elif s["category"] == "Data & AI" and "ai" in desc_lower:
                is_match = True
                importance = "HIGH" if s["skill"] in ["Machine Learning", "Algorithms", "Python"] else "MEDIUM"
            elif s["category"] == "Web & Cloud" and ("developer" in desc_lower or "web" in desc_lower):
                is_match = True
                importance = "HIGH" if s["skill"] in ["HTML", "CSS", "JavaScript", "React", "Git"] else "MEDIUM"
            elif s["category"] == "Business & Management" and ("business" in desc_lower or "management" in desc_lower or "analyst" in desc_lower):
                is_match = True
                importance = "HIGH" if s["skill"] in ["Business Analysis", "Communication", "Problem Solving"] else "MEDIUM"
            elif s["category"] == "Science & Research" and "research" in desc_lower:
                is_match = True
                importance = "HIGH" if s["skill"] in ["Research Methodology", "Academic Writing"] else "MEDIUM"
            elif s["category"] == "Finance" and "finance" in desc_lower:
                is_match = True
                importance = "HIGH" if s["skill"] in ["Financial Accounting", "Economics"] else "MEDIUM"

            if is_match:
                career_skills.append({"career_id": c["id"], "skill_id": s["id"], "importance": importance})
                mapped_count += 1
                
        if mapped_count < 3:
            for s in random.sample(skill_list_raw, 3 - mapped_count):
                career_skills.append({"career_id": c["id"], "skill_id": s["id"], "importance": "MEDIUM"})

    with open("datasets/career_skills.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["career_id", "skill_id", "importance"])
        for cs in career_skills:
            writer.writerow([cs["career_id"], cs["skill_id"], cs["importance"]])
    print(f"Generated {len(career_skills)} career_skills mappings.")

    # 4. Generate Courses
    courses = []
    course_providers = ["Coursera", "Udemy", "edX", "NPTEL", "Great Learning", "Simplilearn", "SWAYAM", "Google Career Certificates"]
    course_levels = ["Beginner", "Intermediate", "Advanced"]
    
    course_templates = [
        ("Python for Data Science and AI", "Python,Data Analytics,Statistics", 8, "Beginner"),
        ("Mastering Data Structures & Algorithms", "Data Structures,Algorithms,C++", 12, "Intermediate"),
        ("React - The Complete Guide", "React,JavaScript,HTML,CSS", 10, "Beginner"),
        ("Machine Learning Specialization", "Machine Learning,Python,Linear Algebra", 16, "Intermediate"),
        ("Deep Learning and Neural Networks", "Deep Learning,PyTorch,TensorFlow", 14, "Advanced"),
        ("AWS Certified Solutions Architect", "AWS,Google Cloud,Docker", 12, "Intermediate"),
        ("UI/UX Design Masterclass", "UI/UX Design,Figma,Prototyping", 8, "Beginner"),
        ("Introduction to Financial Accounting", "Financial Accounting,Economics,SQL", 6, "Beginner"),
        ("Product Management Fundamental Course", "Product Management,Agile,Scrum", 6, "Beginner"),
        ("Cybersecurity Threat Detection and Mitigation", "REST APIs,SQL,Communication", 10, "Intermediate"),
        ("Academic Writing & Research Methodology", "Research Methodology,Academic Writing", 4, "Beginner"),
        ("SQL Masterclass: SQL for Analytics", "SQL,Data Analytics,Pandas", 6, "Beginner"),
        ("Full-Stack Web Development Bootcamp", "Node.js,Express,React,MongoDB", 24, "Intermediate"),
        ("Google Project Management Certificate", "Project Management,Agile,Scrum", 12, "Beginner"),
        ("UPSC Preparation: Indian Polity and History", "Leadership,Public Speaking,Communication", 40, "Beginner"),
        ("Corporate Law & Contract Drafting", "Technical Writing,Communication", 12, "Intermediate"),
        ("Embedded C Programming for IoT Devices", "C++,Docker,Kubernetes", 10, "Intermediate"),
        ("Statistical Inference for Researchers", "Statistics,Mathematics,Pandas", 8, "Intermediate"),
        ("Business Strategy & Finance for Founders", "Business Strategy,Economics,Financial Accounting", 8, "Advanced"),
        ("Technical Writing for Software Engineers", "Technical Writing,Communication", 4, "Beginner")
    ]
    
    for i in range(500):
        tmpl = course_templates[i % len(course_templates)]
        career_obj = careers[i % len(careers)]
        skills_matched = []
        c_skills = [cs["skill_id"] for cs in career_skills if cs["career_id"] == career_obj["id"]]
        if c_skills:
            skills_matched = [s["skill"] for s in skill_list_raw if s["id"] in c_skills[:3]]
        else:
            skills_matched = tmpl[1].split(",")
            
        courses.append({
            "id": i + 1,
            "title": f"{tmpl[0]} - Edition {i // len(course_templates) + 1}",
            "provider": random.choice(course_providers),
            "career": career_obj["title"],
            "skills": ",".join(skills_matched),
            "duration": tmpl[2] + random.randint(-2, 4),
            "level": random.choice(course_levels)
        })
        
    with open("datasets/courses.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "title", "provider", "career", "skills", "duration", "level"])
        for c in courses:
            writer.writerow([c["id"], c["title"], c["provider"], c["career"], c["skills"], c["duration"], c["level"]])
    print(f"Generated {len(courses)} courses.")

    # 5. Generate Exams
    exams = []
    exam_names = [
        ("GATE (Graduate Aptitude Test in Engineering)", "IISc / IITs", "B.Tech/BE, M.Sc, MCA", "B.Tech CSE/ECE/EE/ME/CE", "Engineering,Technology", "01-09-2026", "30-09-2026", "https://gate2027.iitd.ac.in"),
        ("JEE Main (Joint Entrance Examination)", "NTA", "Class 12", "PCM Stream", "Engineering", "01-11-2026", "30-11-2026", "https://jeemain.nta.nic.in"),
        ("JEE Advanced", "IITs", "JEE Main Qualified", "PCM Stream", "Engineering", "20-04-2027", "10-05-2027", "https://jeeadv.ac.in"),
        ("CAT (Common Admission Test)", "IIMs", "Any Bachelor's Degree", "All Branches", "Business,Management", "05-08-2026", "15-09-2026", "https://iimcat.ac.in"),
        ("UPSC Civil Services Examination", "UPSC", "Any Bachelor's Degree", "All Branches", "Government Jobs,Social Impact", "01-02-2027", "22-02-2027", "https://upsc.gov.in"),
        ("NEET UG (National Eligibility cum Entrance Test)", "NTA", "Class 12", "PCB Stream", "Medicine", "01-03-2027", "10-04-2027", "https://neet.nta.nic.in"),
        ("NEET PG", "NBE", "MBBS", "Medicine", "Medicine", "05-01-2027", "05-02-2027", "https://nbe.edu.in"),
        ("CLAT (Common Law Admission Test)", "Consortium of NLUs", "Class 12 / LLB", "All Branches", "Law", "01-07-2026", "15-10-2026", "https://consortiumofnlus.ac.in"),
        ("NDA (National Defence Academy Exam)", "UPSC", "Class 12", "PCM/Arts/Commerce", "Defence,Government Jobs", "15-05-2026", "04-06-2026", "https://upsc.gov.in"),
        ("CDS (Combined Defence Services Exam)", "UPSC", "Bachelor's Degree", "All Branches", "Defence,Government Jobs", "15-05-2026", "04-06-2026", "https://upsc.gov.in"),
        ("IIT JAM (Joint Admission Test for Masters)", "IITs", "B.Sc", "Physics, Chemistry, Maths, Bio", "Research,Science", "05-09-2026", "11-10-2026", "https://jam.iitd.ac.in"),
        ("GPAT (Graduate Pharmacy Aptitude Test)", "NTA", "B.Pharm", "Pharmacy", "Medicine,Research", "10-02-2027", "15-03-2027", "https://gpat.nta.nic.in"),
        ("UGC NET", "NTA", "Postgraduate Degree", "Humanities, CS, Social Sciences", "Education,Research", "10-04-2027", "15-05-2027", "https://ugcnet.nta.nic.in"),
        ("CSIR NET", "NTA", "M.Sc, Integrated BS-MS, B.Tech", "Science, Engineering", "Research,Science", "15-04-2027", "20-05-2027", "https://csirnet.nta.nic.in"),
        ("CEED (Common Entrance Examination for Design)", "IIT Bombay", "Bachelor's Degree / Class 12+", "Design, Art, B.Arch, B.Tech", "Design,Technology", "05-10-2026", "11-11-2026", "https://ceed.iitb.ac.in"),
        ("UCEED (Undergraduate Common Entrance Exam for Design)", "IIT Bombay", "Class 12", "All Streams", "Design", "05-10-2026", "11-11-2026", "https://uceed.iitb.ac.in"),
        ("XAT (Xavier Aptitude Test)", "XLRI", "Any Bachelor's Degree", "All Branches", "Business,Management", "15-07-2026", "30-11-2026", "https://xatonline.in"),
        ("NMAT by GMAC", "GMAC", "Any Bachelor's Degree", "All Branches", "Business,Management", "01-08-2026", "10-10-2026", "https://register.nmat.org"),
        ("SNAP (Symbiosis National Aptitude Test)", "SIU", "Any Bachelor's Degree", "All Branches", "Business,Management", "20-08-2026", "23-11-2026", "https://snaptest.org"),
        ("IBPS PO (Probationary Officers Exam)", "IBPS", "Any Bachelor's Degree", "All Branches", "Government Jobs,Finance", "01-08-2026", "22-08-2026", "https://ibps.in")
    ]
    
    for i in range(100):
        name_tuple = exam_names[i % len(exam_names)]
        exams.append({
            "id": i + 1,
            "name": f"{name_tuple[0]} - {2026 + i // len(exam_names)}",
            "conducting_body": name_tuple[1],
            "eligibility": name_tuple[2],
            "education": name_tuple[2],
            "branches": name_tuple[3],
            "application_start": name_tuple[5],
            "deadline": name_tuple[6],
            "official_url": name_tuple[7]
        })
        
    with open("datasets/exams.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "conducting_body", "eligibility", "education", "branches", "application_start", "deadline", "official_url"])
        for e in exams:
            writer.writerow([e["id"], e["name"], e["conducting_body"], e["eligibility"], e["education"], e["branches"], e["application_start"], e["deadline"], e["official_url"]])
    print(f"Generated {len(exams)} exams.")

    # 6. Generate Scholarships
    scholarships = []
    scholarship_templates = [
        ("NSP (National Scholarship Portal) Central Sector Scheme", "Government of India", "Class 12 / College Students", "Class 12 / Undergrad", "Government Jobs,Social Impact", "Up to Rs. 20,000 / year", "31-10-2026", "https://scholarships.gov.in"),
        ("KVPY (Kishore Vaigyanik Protsahan Yojana)", "DST, Govt of India", "Class 11, Class 12, B.Sc 1st Year", "Class 11/12/B.Sc", "Research,Science", "Up to Rs. 7,000 / month + Contingency", "30-10-2026", "http://www.kvpy.iisc.ernet.in"),
        ("HDFC Bank Badhte Kadam Scholarship", "HDFC Bank", "Class 11 to Undergrad", "Class 11 to Undergrad", "Social Impact", "Up to Rs. 1,00,000 / year", "30-09-2026", "https://www.buddy4study.com"),
        ("Reliance Foundation Undergraduate Scholarships", "Reliance Foundation", "First Year UG Students", "Undergrad", "Technology,Engineering,Business", "Up to Rs. 2,00,000", "15-10-2026", "https://www.reliancefoundation.org"),
        ("Tata Scholarship at Cornell University", "Tata Trusts", "Undergraduate Admissions at Cornell", "Undergrad (Study Abroad)", "Technology,Engineering,Business", "Full Tuition Support", "15-03-2027", "https://admissions.cornell.edu"),
        ("Aditya Birla Capital Scholarship", "Aditya Birla Capital Foundation", "Class 9 to Undergrad", "Class 9 to Undergrad", "Social Impact", "Up to Rs. 60,000", "30-09-2026", "https://www.adityabirlacapital.com"),
        ("L'Oréal India For Young Women In Science Scholarship", "L'Oréal India", "Class 12 Girls (Science)", "Class 12 (Girls)", "Science,Research", "Rs. 2,50,000 for graduation", "15-10-2026", "https://www.foryoungwomeninscience.co.in"),
        ("Dr. Ambedkar Post Matric Scholarship for EBC Students", "Ministry of Social Justice", "EBC Postgraduate/Undergrad", "Undergrad/Postgrad", "Government Jobs,Social Impact", "Maintenance allowance and fees reimbursed", "30-11-2026", "https://scholarships.gov.in"),
        ("Sitaram Jindal Foundation Scholarship", "Sitaram Jindal Foundation", "Class 11 to Postgrad, ITI, Diploma", "Class 11 to Postgrad", "Social Impact", "Up to Rs. 3,200 / month", "31-12-2026", "https://sitaramjindalfoundation.org"),
        ("INSPIRE Scholarship (SHE)", "DST, Govt of India", "Class 12 Top 1% students in Board", "B.Sc/Int. M.Sc", "Research,Science", "Rs. 80,000 / year", "31-12-2026", "https://online-inspire.gov.in"),
        ("AICTE Pragati Scholarship for Girl Students", "AICTE", "First Year Degree/Diploma Girls", "B.Tech/Diploma", "Engineering,Technology", "Rs. 50,000 / year", "30-11-2026", "https://www.aicte-india.org"),
        ("Adobe India Women in Technology Scholarship", "Adobe India", "Undergraduate CSE/ECE Girls", "B.Tech/BE (CSE/ECE)", "Technology,AI/ML", "Tuition fees + Intern interview", "15-11-2026", "https://www.adobe.com"),
        ("K.C. Mahindra Scholarships for Post-Graduate Studies Abroad", "K.C. Mahindra Education Trust", "Graduates pursuing PG Abroad", "Postgrad (Study Abroad)", "Engineering,Business,Science", "Up to Rs. 8,00,000 interest-free loan", "31-03-2027", "https://www.kcmet.org"),
        ("LIC Golden Jubilee Scholarship", "LIC of India", "Class 12 / Diploma (EWS)", "Undergrad/Diploma", "Social Impact", "Rs. 20,000 / year", "24-12-2026", "https://licindia.in"),
        ("Prime Minister's Scholarship Scheme (PMSS)", "Ministry of Defence", "Wards of Ex-servicemen UG/PG", "Undergrad/Postgrad", "Defence,Government Jobs", "Up to Rs. 3,000 / month", "30-11-2026", "https://desw.gov.in"),
        ("Olay Scholarship for Women in STEM", "Olay India / Buddy4Study", "Girls enrolled in STEM Degrees", "Undergrad (STEM)", "Science,Technology,Engineering", "Rs. 1,00,000", "15-12-2026", "https://www.buddy4study.com"),
        ("British Council Great Scholarships", "British Council", "Undergraduates going to UK", "Postgrad (Study Abroad)", "All Branches", "GBP 10,000 tuition fee waiver", "30-04-2027", "https://study-uk.britishcouncil.org"),
        ("DAAD Scholarships for PG Studies in Germany", "DAAD Germany", "Bachelor Graduates in India", "Postgrad (Study Abroad)", "Science,Engineering", "Full stipend + health insurance", "15-10-2026", "https://www.daad.in"),
        ("Fulbright-Nehru Master's Fellowships", "USIEF", "Bachelor Graduates with 3y work exp", "Postgrad (Study Abroad)", "All Branches", "J-1 visa support, tuition, health insurance", "15-05-2026", "https://www.usief.org.in"),
        ("Fair & Lovely Career Foundation Scholarship", "Hindustan Unilever", "Class 12 / College Girls", "Class 12 to Postgrad", "Social Impact", "Up to Rs. 50,000", "30-10-2026", "https://www.buddy4study.com")
    ]
    
    for i in range(200):
        t = scholarship_templates[i % len(scholarship_templates)]
        scholarships.append({
            "id": i + 1,
            "name": f"{t[0]} - {2026 + i // len(scholarship_templates)}",
            "provider": t[1],
            "eligibility": t[2],
            "education": t[3],
            "category": t[4],
            "amount": t[5],
            "deadline": t[6],
            "official_url": t[7]
        })
        
    with open("datasets/scholarships.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "provider", "eligibility", "education", "category", "amount", "deadline", "official_url"])
        for s in scholarships:
            writer.writerow([s["id"], s["name"], s["provider"], s["eligibility"], s["education"], s["category"], s["amount"], s["deadline"], s["official_url"]])
    print(f"Generated {len(scholarships)} scholarships.")

    # 7. Generate Opportunities (1,000+)
    opp_categories = ["Scholarships", "Internships", "Hackathons", "Competitions", "Exams", "Fellowships", "Research", "Workshops", "Conferences", "Certifications", "Student Programs", "Ambassador Programs", "Volunteering", "Government Opportunities", "Study Abroad", "Entrepreneurship", "Innovation Challenges"]
    education_levels = ["Class 10", "Class 12", "Diploma", "Undergraduate", "Postgraduate", "Graduate"]
    branches = ["Computer Science", "Electronics & Communication", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Biotechnology", "Business/BBA", "Commerce/B.Com", "Science/B.Sc", "Arts/Humanities", "Medicine/MBBS", "Law/LLB", "All Branches"]
    modes = ["ONLINE", "OFFLINE", "HYBRID"]
    organizations = ["Google", "Microsoft", "Amazon", "ISRO", "DRDO", "TCS", "Infosys", "NITI Aayog", "Ministry of Education", "HDFC Bank", "Tata Trusts", "IEEE", "ACM", "GitHub", "Major League Hacking", "Coursera", "Udemy", "IIT Bombay", "IIT Madras", "AICTE", "Reliance Foundation", "British Council", "DAAD", "USIEF", "Startup India", "Buddy4Study", "Kaggle", "Smart India Hackathon", "UNESCO", "CERN"]

    opp_templates = [
        ("Smart India Hackathon", "Hackathons", "National level digital product building competition solving government problems.", "Undergraduate,Postgraduate", "Computer Science,Electronics & Communication,All Branches", "Python,React,SQL", "OFFLINE", "Rs. 1,00,000", "0", "https://sih.gov.in"),
        ("Google Summer of Code (GSoC)", "Internships", "Global program matching students with open source organizations.", "Undergraduate,Postgraduate,Graduate", "Computer Science,All Branches", "Python,Java,C++,JavaScript,Git", "ONLINE", "Stipend ($1500 - $3000)", "0", "https://summerofcode.withgoogle.com"),
        ("ISRO Fellowship Program", "Fellowships", "Research fellowship for postgraduate students in aerospace, remote sensing, and computing.", "Postgraduate,Graduate", "Computer Science,Electronics & Communication,All Branches", "Research Methodology,Academic Writing,Python", "OFFLINE", "Rs. 35,000 / month", "0", "https://isro.gov.in"),
        ("Kaggle ML Competition: Indian Housing", "Competitions", "Solve machine learning regression challenges on public Indian dataset.", "Undergraduate,Postgraduate,Graduate", "Computer Science,Science/B.Sc,All Branches", "Python,Machine Learning,Statistics", "ONLINE", "Prizes up to $10,000", "0", "https://kaggle.com"),
        ("Microsoft Learn Student Ambassador", "Ambassador Programs", "Host workshops and build technical communities in your local college.", "Undergraduate,Postgraduate", "All Branches", "Communication,Public Speaking,Leadership", "HYBRID", "Azure credits, devices, training", "0", "https://mvp.microsoft.com"),
        ("AWS Cloud Practitioner Certification Scholarship", "Certifications", "Voucher scholarship providing 100% exam fee discount for students.", "Undergraduate,Postgraduate", "All Branches", "AWS,Docker,Kubernetes", "ONLINE", "Free Exam Voucher ($100 value)", "0", "https://aws.amazon.com"),
        ("NITI Aayog Internship Scheme", "Internships", "Work on public policy research and analysis under central government experts.", "Undergraduate,Postgraduate", "All Branches", "Research Methodology,Data Analytics,Communication", "OFFLINE", "Unpaid (Certificate + Experience)", "0", "https://niti.gov.in"),
        ("UNESCO Youth Volunteering Fellowship", "Volunteering", "Volunteer for community educational and digital literacy workshops.", "Undergraduate,Postgraduate", "All Branches", "Communication,Leadership,Social Work", "HYBRID", "Certificate + Travel allowance", "0", "https://unesco.org"),
        ("Study Abroad in Germany: DAAD Scholarship", "Study Abroad", "Postgraduate full-degree funding for engineering and science graduates.", "Undergraduate,Postgraduate", "All Branches", "Research Methodology,German Language", "OFFLINE", "Full funding (1,200 EUR/month)", "0", "https://daad.de"),
        ("Startup India Seed Fund Challenge", "Entrepreneurship", "Submit startup pitch to receive incubator grants and mentorship.", "Undergraduate,Postgraduate,Graduate", "All Branches", "Business Strategy,Financial Accounting,Public Speaking", "HYBRID", "Up to Rs. 20 Lakhs funding", "0", "https://startupindia.gov.in"),
        ("Adobe India Women in Tech Internship", "Internships", "Summer internship for female engineering students in product development.", "Undergraduate", "Computer Science,Electronics & Communication", "Java,C++,Data Structures,Algorithms", "OFFLINE", "Stipend Rs. 1,00,000 / month", "0", "https://adobe.com"),
        ("TCS CodeVita Coding Competition", "Competitions", "Global coding contest testing algorithmic problem-solving speed.", "Undergraduate,Postgraduate", "Computer Science,Electronics & Communication,Electrical Engineering,All Branches", "Python,Java,C++,Data Structures,Algorithms", "ONLINE", "Prizes up to $20,000 + Job interview", "0", "https://tcscodevita.com"),
        ("UN Sustainable Development Goals Workshop", "Workshops", "Five-day interactive virtual seminar on local social impact strategies.", "Class 12,Undergraduate,Postgraduate", "All Branches", "Communication,Leadership,Teamwork", "ONLINE", "Participation Certificate", "0", "https://sdg.un.org"),
        ("International Conference on AI & ML (ICML India)", "Conferences", "Global research conference featuring top papers in AI/ML advancements.", "Postgraduate,Graduate", "Computer Science,Science/B.Sc", "Research Methodology,Machine Learning,Deep Learning", "OFFLINE", "Best Paper Award", "Rs. 2,000", "https://icml.cc"),
        ("DRDO Young Scientist Lab Project", "Research", "Participate in defense robotics and computer vision project implementation.", "Undergraduate,Postgraduate,Graduate", "Computer Science,Electronics & Communication,Mechanical Engineering", "C++,Machine Learning,Computer Vision,Python", "OFFLINE", "Monthly stipend Rs. 31,000", "0", "https://drdo.gov.in"),
        ("GitHub Campus Expert Program", "Ambassador Programs", "Learn public speaking and tech organization skills supported by GitHub.", "Undergraduate,Postgraduate", "All Branches", "Communication,Leadership,Git", "ONLINE", "Swags, training and community funding", "0", "https://education.github.com"),
        ("G20 Youth Summit Innovation Challenge", "Innovation Challenges", "Propose tech blueprints addressing renewable energy distribution.", "Undergraduate,Postgraduate", "All Branches", "Problem Solving,Leadership,Business Strategy", "HYBRID", "Certificate + Cash prize Rs. 50,000", "0", "https://g20.org"),
        ("Stanford University Knight-Hennessy Scholars", "Study Abroad", "Full funding for graduate degrees at Stanford University in any field.", "Undergraduate,Postgraduate", "All Branches", "Academic Writing,Leadership,Research Methodology", "OFFLINE", "Full tuition, stipend, travel", "0", "https://knight-hennessy.stanford.edu"),
        ("L&T Build India Scholarship", "Scholarships", "Sponsorship for M.Tech in Construction Technology at IIT Madras/Delhi.", "Undergraduate", "Civil Engineering", "Physics,Civil Engineering,CAD", "OFFLINE", "Tuition sponsored + Stipend Rs. 15,000", "0", "https://lntecc.com"),
        ("National Talent Search Examination (NTSE)", "Exams", "National scholarship exam identifying academic talent in high school.", "Class 10", "All Branches", "Mathematics,Problem Solving", "OFFLINE", "Monthly scholarship support", "0", "https://ncert.nic.in")
    ]
    
    opportunities = []
    start_date = datetime.now() - timedelta(days=60)
    
    for i in range(1050):
        t = opp_templates[i % len(opp_templates)]
        deadline_date = start_date + timedelta(days=random.randint(10, 180))
        deadline_str = deadline_date.strftime("%Y-%m-%d")
        opening_str = (deadline_date - timedelta(days=random.randint(30, 60))).strftime("%Y-%m-%d")
        
        status = "ACTIVE"
        days_to_deadline = (deadline_date - datetime.now()).days
        if days_to_deadline < 0:
            status = "EXPIRED"
        elif days_to_deadline <= 7:
            status = "CLOSING_SOON"
        elif days_to_deadline > 90:
            status = "UPCOMING" if random.random() < 0.15 else "ACTIVE"
            
        edu_req = t[3].split(",")
        branch_req = t[4].split(",")
        skills_req = t[5].split(",")
        
        opp_title = f"{t[0]} - Season {i // len(opp_templates) + 1}"
        if i % 3 == 0:
            opp_title = f"{t[0]} {deadline_date.year}"
            
        opportunities.append({
            "id": i + 1,
            "title": opp_title,
            "organization": random.choice(organizations),
            "category": t[1],
            "description": f"Detailed description for {opp_title}. {t[2]} This provides a perfect match for students looking to excel in their career paths, build hands-on skills, and gain industry recognition.",
            "education": random.choice(education_levels),
            "min_year": random.randint(1, 2),
            "max_year": random.randint(3, 5),
            "branch": random.choice(branches),
            "skills": ",".join(random.sample(skills_req, k=min(len(skills_req), random.randint(1, 3)))),
            "location": random.choice(["Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Remote"]),
            "mode": random.choice(modes),
            "deadline": deadline_str,
            "prize": t[7] if "Rs" in t[7] or "Prizes" in t[7] else "N/A",
            "stipend": t[7] if "Stipend" in t[7] or "Rs." in t[7] else "N/A",
            "fee": t[8],
            "url": t[9],
            "source": t[9],
            "last_verified": (datetime.now() - timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d"),
            "status": status
        })
        
    with open("datasets/opportunities.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "title", "organization", "category", "description", "education", "min_year", "max_year", "branch", "skills", "location", "mode", "deadline", "prize", "stipend", "fee", "url", "source", "last_verified", "status"])
        for o in opportunities:
            writer.writerow([o["id"], o["title"], o["organization"], o["category"], o["description"], o["education"], o["min_year"], o["max_year"], o["branch"], o["skills"], o["location"], o["mode"], o["deadline"], o["prize"], o["stipend"], o["fee"], o["url"], o["source"], o["last_verified"], o["status"]])
    print(f"Generated {len(opportunities)} opportunities.")

    # 8. Generate Student Profiles (5,000+)
    student_profiles = []
    profile_rules = [
        {
            "education": "Undergraduate",
            "branch": "Computer Science",
            "possible_skills": ["Python", "Java", "C++", "Data Structures", "Algorithms", "React", "Node.js", "Git", "REST APIs", "SQL", "JavaScript", "HTML", "CSS"],
            "possible_interests": ["Technology", "AI/ML", "Business"],
            "possible_goals": ["High-paying job", "Corporate career", "Startup", "Higher studies"],
            "career_goals": ["software_engineer", "ai_ml_engineer", "devops_engineer", "data_scientist", "cloud_architect"],
            "recommended_career": "Software Engineer"
        },
        {
            "education": "Undergraduate",
            "branch": "Electronics & Communication",
            "possible_skills": ["C++", "Python", "Data Structures", "AWS", "Docker", "Kubernetes", "Physics Lab", "Mathematics", "Linear Algebra", "Figma"],
            "possible_interests": ["Technology", "Engineering", "Research"],
            "possible_goals": ["High-paying job", "Research", "Corporate career", "Government job"],
            "career_goals": ["embedded_systems_engineer", "vlsi_design_engineer", "iot_systems_architect", "network_security_engineer"],
            "recommended_career": "Embedded Systems Engineer"
        },
        {
            "education": "Undergraduate",
            "branch": "Science/B.Sc",
            "possible_skills": ["Statistics", "Mathematics", "Python", "Data Analytics", "Pandas", "NumPy", "SQL", "Data Visualization", "Communication"],
            "possible_interests": ["Finance", "Research", "Technology", "Business"],
            "possible_goals": ["High-paying job", "Higher studies", "Research", "Corporate career"],
            "career_goals": ["data_analyst", "data_scientist", "actuarial_analyst", "financial_risk_analyst"],
            "recommended_career": "Data Analyst"
        },
        {
            "education": "Undergraduate",
            "branch": "Business/BBA",
            "possible_skills": ["Product Management", "Project Management", "Business Strategy", "Marketing", "SEO", "Sales", "Communication", "Leadership", "Public Speaking"],
            "possible_interests": ["Business", "Management", "Entrepreneurship", "Media"],
            "possible_goals": ["High-paying job", "Corporate career", "Entrepreneurship", "Startup"],
            "career_goals": ["product_manager", "management_consultant", "marketing_manager", "brand_strategist"],
            "recommended_career": "Product Manager"
        },
        {
            "education": "Undergraduate",
            "branch": "Commerce/B.Com",
            "possible_skills": ["Financial Accounting", "Economics", "Taxation", "Scrum", "SQL", "Data Analytics", "Communication", "Problem Solving", "Time Management"],
            "possible_interests": ["Finance", "Business", "Government Jobs"],
            "possible_goals": ["Corporate career", "Government job", "High-paying job"],
            "career_goals": ["chartered_accountant", "investment_banker", "financial_consultant", "stock_trader_portfolio_manager"],
            "recommended_career": "Chartered Accountant"
        },
        {
            "education": "Class 12",
            "branch": "PCM Stream",
            "possible_skills": ["Mathematics", "Physics Lab", "Chemistry Lab", "Python", "Communication", "Writing", "Problem Solving"],
            "possible_interests": ["Engineering", "Research", "Defence", "Government Jobs"],
            "possible_goals": ["Higher studies", "Government job", "Study abroad"],
            "career_goals": ["civil_servant", "defense_officer", "high_school_physics_teacher", "research_scientist"],
            "recommended_career": "Civil Servant (IAS/IPS)"
        },
        {
            "education": "Undergraduate",
            "branch": "Law/LLB",
            "possible_skills": ["Law", "Legal Writing", "Constitutional Law", "Technical Writing", "Communication", "Leadership", "Public Speaking", "Negotiation"],
            "possible_interests": ["Law", "Government Jobs", "Social Impact"],
            "possible_goals": ["Corporate career", "Government job", "Social impact"],
            "career_goals": ["corporate_lawyer", "patent_attorney", "criminal_defense_lawyer", "public_prosecutor"],
            "recommended_career": "Corporate Lawyer"
        }
    ]

    for i in range(5000):
        rule = random.choice(profile_rules)
        selected_skills = random.sample(rule["possible_skills"], k=random.randint(3, min(len(rule["possible_skills"]), 6)))
        selected_interests = random.sample(rule["possible_interests"], k=random.randint(1, min(len(rule["possible_interests"]), 3)))
        selected_goal = random.choice(rule["possible_goals"])
        target_career_name = random.choice(rule["career_goals"])
        
        career_title = "Unknown Career"
        for c in careers:
            if c["career"] == target_career_name:
                career_title = c["title"]
                break
                
        student_profiles.append({
            "education": rule["education"],
            "branch": rule["branch"],
            "skills": ",".join(selected_skills),
            "interests": ",".join(selected_interests),
            "career_goal": career_title,
            "experience": f"{random.randint(0, 2)} projects, {random.randint(0, 1)} internships",
            "recommended_career": rule["recommended_career"]
        })
        
    with open("datasets/student_profiles.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["education", "branch", "skills", "interests", "career_goal", "experience", "recommended_career"])
        for p in student_profiles:
            writer.writerow([p["education"], p["branch"], p["skills"], p["interests"], p["career_goal"], p["experience"], p["recommended_career"]])
    print(f"Generated {len(student_profiles)} student profiles.")

    # 9. Generate Counsellors (100+)
    counsellors = []
    counsellor_names = ["Dr. Ramesh Sharma", "Prof. Sunita Krishnan", "Anjali Mehta", "Rajesh Iyer", "Dr. Amit Patel", "Srinivas Rao", "Meera Deshmukh", "Vikram Singh", "Priya Nair", "Sanjay Gupta"]
    specializations = ["Engineering & Tech Careers", "Higher Studies Abroad", "Management & Business Careers", "Law & Humanities", "Competitive Exams Prep", "Civil Services & Govt Jobs", "Medical & Pharmacy Careers", "Design & Creative Fields"]
    qualifications = ["M.Tech, Ph.D (IIT Bombay)", "MBA (IIM Ahmedabad)", "M.A. Psychology, Counsellor Cert", "LL.M, Career Counsellor", "Ph.D in Education, Ex-UPSC Board Member", "M.Des (NID), UX Specialist"]
    languages_list = ["English, Hindi", "English, Hindi, Marathi", "English, Tamil", "English, Hindi, Bengali", "English, Telugu", "English, Hindi, Gujarati"]

    for i in range(100):
        counsellors.append({
            "id": i + 1,
            "name": f"{random.choice(counsellor_names)} {chr(65 + i % 26)}",
            "qualification": random.choice(qualifications),
            "experience": f"{random.randint(5, 25)} years",
            "specialization": random.choice(specializations),
            "languages": random.choice(languages_list),
            "rating": round(random.uniform(4.2, 5.0), 1),
            "session_price": random.choice([500, 800, 1000, 1200, 1500, 2000]),
            "availability": "Mon-Fri (4PM-8PM), Sat (10AM-4PM)",
            "is_verified": random.choice([True, True, True, False])
        })
        
    with open("datasets/counsellors.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "qualification", "experience", "specialization", "languages", "rating", "session_price", "availability", "is_verified"])
        for c in counsellors:
            writer.writerow([c["id"], c["name"], c["qualification"], c["experience"], c["specialization"], c["languages"], c["rating"], c["session_price"], c["availability"], c["is_verified"]])
    print(f"Generated {len(counsellors)} counsellors.")
    print("Dataset generation complete!")

if __name__ == "__main__":
    main()
