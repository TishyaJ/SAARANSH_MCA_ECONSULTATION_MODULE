from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server
import matplotlib.pyplot as plt
import io
from PIL import Image

app = FastAPI(title="WordCloud API", version="1.0.0")

# API Key for security
API_KEY = "saaransh_wordcloud_2024"

# Enable CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommentRequest(BaseModel):
    comments: List[str]
    title: str = "WordCloud"
    width: int = 1400
    height: int = 700
    background_color: str = "white"
    colormap: str = "viridis"
    max_words: int = 300
    contour_color: str = "steelblue"
    contour_width: int = 2


def generate_wordcloud_image(
    text: str,
    width: int = 1400,
    height: int = 700,
    background_color: str = "white",
    colormap: str = "viridis",
    max_words: int = 300,
    contour_color: str = "steelblue",
    contour_width: int = 2
) -> bytes:
    """
    Generate wordcloud image from text and return as bytes
    """
    if not text or text.strip() == "":
        raise ValueError("Text cannot be empty")
    
    # Generate wordcloud
    wc = WordCloud(
        width=width,
        height=height,
        background_color=background_color,
        colormap=colormap,
        max_words=max_words,
        contour_color=contour_color,
        contour_width=contour_width
    ).generate(text)
    
    # Create figure
    fig = plt.figure(figsize=(15, 7))
    plt.imshow(wc, interpolation='bilinear')
    plt.axis('off')
    plt.tight_layout(pad=0)
    
    # Save to bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    plt.close(fig)
    
    return buf.getvalue()


@app.post("/generate-wordcloud")
async def create_wordcloud(request: CommentRequest, x_api_key: Optional[str] = Header(None)):
    """
    Generate a wordcloud from multiple comments
    
    - **comments**: List of comment strings
    - **title**: Optional title for the wordcloud
    - **width**: Image width (default: 1400)
    - **height**: Image height (default: 700)
    - **background_color**: Background color (default: white)
    - **colormap**: Color scheme (default: viridis)
    - **max_words**: Maximum words to display (default: 300)
    - **contour_color**: Outline color (default: steelblue)
    - **contour_width**: Outline width (default: 2)
    
    Headers:
    - **X-API-Key**: API key for authentication (required)
    
    Returns: PNG image
    """
    # Verify API key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing API key")
    
    try:
        # Validate input
        if not request.comments or len(request.comments) == 0:
            raise HTTPException(status_code=400, detail="Comments list cannot be empty")
        
        # Combine all comments into single text
        combined_text = " ".join([str(comment) for comment in request.comments if comment])
        
        if not combined_text.strip():
            raise HTTPException(status_code=400, detail="All comments are empty")
        
        # Generate wordcloud image
        image_bytes = generate_wordcloud_image(
            text=combined_text,
            width=request.width,
            height=request.height,
            background_color=request.background_color,
            colormap=request.colormap,
            max_words=request.max_words,
            contour_color=request.contour_color,
            contour_width=request.contour_width
        )
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=wordcloud.png"
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating wordcloud: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "WordCloud API",
        "endpoints": {
            "/generate-wordcloud": "POST - Generate wordcloud from comments",
            "/docs": "GET - API documentation"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
