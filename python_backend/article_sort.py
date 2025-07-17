from sentence_transformers.cross_encoder import CrossEncoder
# from sentence_transformers import SentenceTransformer
import os
import requests
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import time

os.environ["TRANSFORMERS_CACHE"] = r"D:\HF_CACHE"
os.environ["HF_HOME"] = r"D:\HF_CACHE"

semantic_scholar_api_key = os.environ.get('semantic_scholar_key')

model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-12-v2", model_kwargs={"torch_dtype": "float16"})

app = Flask(__name__)

@app.route("/", methods=['POST'])
def get_article():
    # Get JSON data from request
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    query = data.get('query')
    # result_openalex = get_articles_for_query_openalex(query)
    result_semantic_scholar = get_articles_for_query_semantic_scholar(query)
    print('semantic_scholar\n\n', result_semantic_scholar[0])
    print('\n\n\n')

    return jsonify(result_semantic_scholar)



def get_articles_for_query_semantic_scholar(query):
    base_url = "https://api.semanticscholar.org/graph/v1/paper/search"
    pages_to_fetch = 3
    limit = 100
    fields_str = "title,abstract,year,citationCount,journal,authors,tldr"
    all_results = []
    for p in range(0, pages_to_fetch):
        print(p)
        time.sleep(1.1)
        params = {
            "query": query,
            "fields": fields_str,
            "limit": limit,
            'offset':p*limit,
        }
        headers = {
                "x-api-key": semantic_scholar_api_key
            }

        try:
            response = requests.get(base_url, params=params, headers=headers)
            response.raise_for_status()  # raises an exception for 4xx/5xx errors
            data = response.json()
            results = data['data']
            all_results.extend(results)
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
    all_results_clean = [{
                'title':r.get('title') or None,
                'abstract':r.get('abstract') or None,
                'year':r.get('year') or None,
                'citationCount':r.get('citationCount') or None,
                'journal':r.get('journal') or None,
                'authors':get_authors_name_ss(r.get('authors')) or None,
                'tldr':get_tldr_text(r.get('tldr')) or None,
                } for r in all_results
    ]
    texts = [(r['title'] or '') + ' '  + (r['tldr'] or '' + ' '+ (r['abstract'] or '' ) ) for r in all_results_clean]
    ranks = model.rank(query, texts)
    sorted_data = [all_results_clean[r['corpus_id']] for r in ranks]
    # print(sorted_data[:5])
    return sorted_data

def get_authors_name_ss(authors_list):
    try:
        return [a.get('name') for a in authors_list]
    except:
        return ''
    
def get_tldr_text(tldr):
    if tldr:
        return tldr.get('text')

def get_articles_for_query_openalex(query):
    base_url = "https://api.openalex.org/works"
    pages_to_fetch = 2
    all_results = []
    for p in range(1, pages_to_fetch+1):
        print(p)
        params = {
            "search": query,
            "filter": "has_abstract:true",
            "per-page": 200,
            'page':p,
            "select": "doi,title,display_name,authorships,publication_year,cited_by_count,abstract_inverted_index",
        }

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()  # raises an exception for 4xx/5xx errors
            data = response.json()
            results = data['results']
            all_results.extend(results)
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")

    all_results = [{'doi':r['doi'], 'title':r['title'], 'display_name':r['display_name'], 'authorships':authorshipsToAuthors(r['authorships']), 'publication_year':r['publication_year'], 'cited_by_count':r['cited_by_count'], 'abstract':aiiToString(r['abstract_inverted_index'])} for r in all_results]
    # print(all_results[:5])
    
    texts = [(r['title'] or '') + ' ' + (r['abstract'] or '') for r in all_results]
    ranks = model.rank(query, texts)
    sorted_data = [all_results[r['corpus_id']] for r in ranks]
    # print(sorted_data[:5])
    return sorted_data


def get_articles_for_query_crossref(query):
    url = "https://api.crossref.org/works"

    params = {
        "select": "DOI,title,author,abstract,published,container-title,references-count,is-referenced-by-count",
        "offset": 0,
        "rows": 1000,
        "query": query,
        "mailto": "davood.wadi@ucanwest.ca"
    }

    headers = {
        "User-Agent": "MyAppName/1.0 (mailto:davood.wadi@ucanwest.ca)"
    }

    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()
        # For example, print the titles of retrieved works:
        # for item in data['message']['items']:
        #     print(item.get('title', ['No title'])[0])
    else:
        print(f"Request failed with status code {response.status_code}")
    all_results = data['message']['items']
    print(all_results[0])

    texts = [(r.get('title')[0] if r.get('title') else '') + ' ' + (r.get('abstract') or '') for r in all_results]
    ranks = model.rank(query, texts)
    sorted_data = [all_results[r['corpus_id']] for r in ranks]
    # print(sorted_data[:5])
    return sorted_data


def authorshipsToAuthors(authorship):
    return [a['raw_author_name'] for a in authorship]

def aiiToString(aii):
  tuples = []
  for word, index in aii.items():
    for i in index:
      tuples.append((word, i))
  sorted_tuples = sorted(tuples, key=lambda x: x[1])
  return ' '.join([item[0] for item in sorted_tuples])



if __name__ == '__main__':
    app.run(debug=True)