import uvicorn
import shutil
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import HTMLResponse,JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="")


@app.post("/model/{model_name}")
async def handle_form(request: Request, model_name: str,assignment: str = Form(...), assignment_file: UploadFile = Form(...)):
    #content_assignment = await assignment_file.read()
    with open('static/temp/temp.'+assignment_file.filename.split('.')[-1], "wb") as buffer:
        #buffer.write((await assignment_file.read()).decode())
        content = await assignment_file.read()
        buffer.write(content)
        #shutil.copyfileobj(assignment_file.file, buffer)
    return {"filename": assignment_file.filename}
    #return templates.TemplateResponse("model.html", {"request": request, "model_name": model_name})
    
@app.get("/model/{model_name}", response_class=HTMLResponse)
async def write_model(request: Request, model_name: str):
    return templates.TemplateResponse("model.html", {"request": request, "model_name": model_name})

@app.get("/", response_class=HTMLResponse)
async def read_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/models.json")
async def read_models_json():
    r = open("models.json", 'r', encoding='utf-8').read()
    return r

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
