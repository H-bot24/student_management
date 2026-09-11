from fastapi import FastAPI
from supabase import create_client
from dotenv import load_dotenv
import os

# load variables from .env located in the parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

# Create FastAPI application
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Connect Python to Supabase
supabase = create_client(
SUPABASE_URL,
SUPABASE_KEY
)

# try:
#     testResponse = supabase.table("students").select("*").execute()
#     print("Connection successful!")
#     print(testResponse.data)

# except Exception as e:
#     print("Error occured: ",e)

@app.post("/students")
def create_student(name: str, course: str, marks: int):

    # Data to be inserted into Supabase
    student = {
    "name": name,
    "course": course,
    "marks": marks
    }

    # Insert student into Supabase
    response = (
    supabase
    .table("students")
    .insert(student)
    .execute()
    )
    
    # Return database response
    return {
    "message": "Student created successfully",
    "data": response.data
    }

@app.get("/students")
def show_all_student():
    response = (
        supabase
        .table("students")
        .select("*")
        .execute()
    )
    return{
    "message": "All students",
        "data": response.data
    }

@app.patch("/students")
def update_student(id: int, name: str, course: str, marks: int):
    student ={
        "name": name,
        "course": course,
        "marks": marks
    }

    response = (
        supabase
        .table("students")
        .update(student)
        .eq("id", id)
        .execute()
    )

    return{
        "message": f"Data of id {id} updated successfully.",
        "data": response.data
    }

@app.delete("/students")
def delete_student(id: int):
    response = (
        supabase
        .table("students")
        .delete()
        .eq("id",id)
        .execute()
    )
    return{
        "message": f"Data of id {id} deleted successfully.",
        "data": response.data
    }

@app.get("/students/{id}")
def get_one(id: int):
    response = (
        supabase
        .table("students")
        .select("*")
        .eq("id",id)
        .execute()
    )
    return{
        "message": f"Data of id {id}",
        "data": response.data
    }