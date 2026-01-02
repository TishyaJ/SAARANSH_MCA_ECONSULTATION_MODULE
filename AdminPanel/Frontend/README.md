# Project Saaransh: AI-Powered E-Consultation Feedback Analysis

## About The Project

The eConsultation module on the Ministry of Corporate Affairs (MoCA) website is a vital platform for public participation in the legislative process. It allows stakeholders to submit comments and suggestions on draft legislation. However, a high volume of submissions presents a significant challenge, creating a risk that valuable feedback may be inadvertently overlooked or inadequately analyzed.

**Project Saaransh** is an AI-powered solution designed to automate and enhance the analysis of comments received through this module. The project aims to equip MoCA officials with intelligent tools to systematically process, categorize, and understand stakeholder feedback, ensuring every submission is given due consideration.

## Core Objectives

The primary goal of this project is to reduce the manual effort required to analyze feedback by providing deep, automated insights. This is achieved through three key features:

*  **Sentiment Analysis:** Automatically classify the sentiment of each comment (e.g., Positive, Negative, Neutral) to gauge the overall public opinion on specific provisions and the draft legislation as a whole.
*  **Summary Generation:** Generate accurate, concise summaries of lengthy comments to capture their core meaning without requiring a full manual review.
*  **Word Cloud Visualization:** Create a dynamic word cloud from all submissions to visually represent the most frequently used keywords and highlight key areas of public focus.

## Key Features

* **Automated Sentiment Scoring:** Analyze comments individually and provide an aggregate sentiment score for the entire draft legislation.
* **Extractive & Abstractive Summarization:** Employ advanced NLP models to generate meaningful summaries that preserve the original context.
* **Interactive Dashboard:** A user-friendly interface to view overall statistics, filter comments by sentiment, and explore the word cloud.
* **Scalable Architecture:** Built to efficiently handle thousands of comments submitted during the consultation period.

## Technology Stack (Proposed)

* **Backend:** Python (Flask / FastAPI)
* **NLP/ML Libraries:** Hugging Face Transformers, NLTK, spaCy, Scikit-learn
* **Data Processing:** Pandas, NumPy
* **Frontend/Dashboard:** Streamlit / Dash / React
* **Database:** PostgreSQL / SQLite

## Expected Outcome

Project Saaransh will empower the Ministry to:
* **Save significant time and resources** in the feedback analysis process.
* **Ensure a comprehensive review** of all stakeholder comments, minimizing the risk of oversight.
* **Gain rapid, data-driven insights** into public sentiment and key concerns.
* **Improve the quality and transparency** of the legislative process by systematically incorporating public feedback.
