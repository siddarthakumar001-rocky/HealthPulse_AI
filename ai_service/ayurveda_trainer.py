import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PKL = os.path.join(BASE_DIR, '..', 'AyurGenixAI_Dataset.pkl')
OUTPUT_DIR = os.path.join(BASE_DIR, 'models')

os.makedirs(OUTPUT_DIR, exist_ok=True)

def train_ayurvedic_engine():
    print("*** Training AyurGenix NLP and Recommendation Engine ***")
    if not os.path.exists(DATA_PKL):
        print(f"Error: Could not find {DATA_PKL}")
        return
    
    df = joblib.load(DATA_PKL)
    print(f"Loaded dataset with {len(df)} records across {df['Disease'].nunique()} unique diseases.")
    
    df['clean_symptoms'] = df['Symptoms'].astype(str).str.lower().str.strip()
    
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words='english',
        max_features=2500
    )
    tfidf_matrix = vectorizer.fit_transform(df['clean_symptoms'])
    
    vec_path = os.path.join(OUTPUT_DIR, 'ayurvedic_vectorizer.joblib')
    matrix_path = os.path.join(OUTPUT_DIR, 'ayurvedic_tfidf_matrix.joblib')
    kb_path = os.path.join(OUTPUT_DIR, 'ayurvedic_kb.joblib')
    
    joblib.dump(vectorizer, vec_path)
    joblib.dump(tfidf_matrix, matrix_path)
    joblib.dump(df, kb_path)
    
    print(f"Saved vectorizer to {vec_path}")
    print(f"Saved TF-IDF matrix to {matrix_path}")
    print(f"Saved knowledge base to {kb_path}")
    
    test_query = "joint pain and stiffness in morning"
    q_vec = vectorizer.transform([test_query])
    scores = cosine_similarity(q_vec, tfidf_matrix)[0]
    best_idx = scores.argmax()
    best_match = df.iloc[best_idx]
    
    print("\n--- Test Verification ---")
    print(f"Input Symptoms: '{0}'".format(test_query))
    print(f"Matched Disease: {best_match['Disease']} (Similarity: {scores[best_idx]:.1%})")
    print(f"Doshas: {best_match.get('Doshas', 'N/A')}")
    print(f"Ayurvedic Herbs: {best_match.get('Ayurvedic Herbs', 'N/A')}")
    print(f"Formulation: {best_match.get('Formulation', 'N/A')}")
    print("********************************************************\n")

if __name__ == '__main__':
    train_ayurvedic_engine()