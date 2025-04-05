import streamlit as st
import pandas as pd
import json
import os
import re
from typing import List, Dict, Any, Optional, Tuple
from openai import OpenAI, AzureOpenAI # Added AzureOpenAI for DeepSeek compatibility
from anthropic import Anthropic
import google.generativeai as genai

# --- Model Definitions with Tiers/Cost Indicators ---
# Note: Tiers are approximate and relative. Check provider pricing pages for details.
MODEL_OPTIONS = {
    "openai": {
        "gpt-4o": "gpt-4o (Balanced/Latest)",
        "gpt-4-turbo": "gpt-4-turbo (Powerful)",
        "gpt-3.5-turbo": "gpt-3.5-turbo (Fast/Cheap)"
    },
    "anthropic": {
        "claude-3-opus-20240229": "claude-3-opus-20240229 (Most Powerful)",
        "claude-3-sonnet-20240229": "claude-3-sonnet-20240229 (Balanced)",
        "claude-3-haiku-20240307": "claude-3-haiku-20240307 (Fastest/Cheapest)"
    },
    "google": {
        "gemini-1.5-pro-latest": "gemini-1.5-pro-latest (Powerful)",
        "gemini-1.5-flash-latest": "gemini-1.5-flash-latest (Fast)",
        "gemini-1.0-pro": "gemini-1.0-pro (General)" 
    },
    "deepseek": {
        "deepseek-chat": "deepseek-chat (General Chat)",
        "deepseek-coder": "deepseek-coder (Code-focused)"
    }
}

# Helper to get model ID from display name
def get_model_id(display_name: str) -> Optional[str]:
    """Extracts the model ID from the display string (e.g., 'gpt-4o (Balanced)' -> 'gpt-4o')."""
    match = re.match(r"([^(]+)", display_name)
    return match.group(1).strip() if match else None

# --- Agent Classes (Firecrawl, Exa - unchanged mocks) ---
class FirecrawlAgent:
    """Agent that crawls and extracts data from competitor websites"""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("FIRECRAWL_API_KEY", "")
        
    def crawl_website(self, url: str) -> Dict[str, Any]:
        print(f"Mock Crawling: {url}") 
        return {
            "url": url, "title": f"Website for {url.split('://')[1].split('.')[0].capitalize()}",
            "description": f"A company specializing in services and products.",
            "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "metadata": {"technologies": ["React", "AWS", "MongoDB"], "team_size": "50-200", "founded": "2015"}
        }
    
    def summarize_content(self, content: str) -> str:
        print("Mock Summarizing content...") 
        return "This company provides various products and services in the technology sector, focusing on innovation and customer satisfaction."

class ExaSearchAgent:
    """Agent that discovers competitors using Exa AI search"""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("EXA_API_KEY", "")
        
    def find_similar_companies(self, company_description: str, count: int = 5) -> List[Dict[str, str]]:
        print(f"Mock Finding similar companies for: {company_description[:50]}...") 
        companies = [
            {"name": "CompetitorA", "url": "https://competitora.com", "description": "A leading provider in the industry"},
            {"name": "CompetitorB", "url": "https://competitorb.com", "description": "An innovative startup disrupting the market"},
            {"name": "CompetitorC", "url": "https://competitorc.com", "description": "A well-established player with global reach"},
            {"name": "CompetitorD", "url": "https://competitord.com", "description": "A niche specialist with unique offerings"},
            {"name": "CompetitorE", "url": "https://competitore.com", "description": "A fast-growing company with cutting-edge tech"}
        ]
        return companies[:count]
    
    def extract_urls_from_description(self, description: str) -> List[str]:
        urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+', description)
        return urls

# --- Analysis Agent (Updated) ---
class AnalysisAgent:
    """Agent that generates detailed competitive analysis using a selected LLM"""
    # Define base URLs for providers compatible with OpenAI client
    BASE_URLS = {
        "deepseek": "https://api.deepseek.com/v1" 
    }

    def __init__(self, provider: str = "openai", api_key: Optional[str] = None, model_id: Optional[str] = None):
        self.provider = provider.lower() 
        self.api_key = api_key
        self.model_id = model_id # Store the actual model ID
        self.base_url = self.BASE_URLS.get(self.provider)
        self.client = None

        if not self.model_id:
             # Should not happen if UI selectbox is used correctly, but good fallback
             st.warning(f"No model selected for provider: {self.provider}. Analysis may fail or use mock data.")
             return 

        if self.api_key:
            try:
                if self.provider == "openai":
                    self.client = OpenAI(api_key=self.api_key)
                elif self.provider == "anthropic":
                    self.client = Anthropic(api_key=self.api_key)
                elif self.provider == "google":
                    genai.configure(api_key=self.api_key)
                    self.client = genai.GenerativeModel(self.model_id) 
                elif self.provider in self.BASE_URLS: 
                     if not self.base_url:
                          raise ValueError(f"Base URL required for provider {self.provider} but not found.")
                     self.client = AzureOpenAI(
                          api_key=self.api_key,
                          api_version="2024-02-15-preview", 
                          azure_endpoint=self.base_url, 
                     )
                else:
                    raise ValueError("Unsupported LLM provider specified")
            except Exception as e:
                 st.error(f"Failed to initialize LLM client for {self.provider}: {e}")
                 self.client = None 
        
    def _generate_prompt(self, company_data: List[Dict[str, Any]]) -> str:
        """Helper function to create the analysis prompt"""
        prompt = "Analyze the following competitor data and provide a detailed report including:\n"
        prompt += "- Strengths\n- Weaknesses\n- Opportunities\n- Market Gaps\n"
        prompt += "- Suggested Pricing Strategies\n- Potential Growth Opportunities\n- Actionable Recommendations\n\n"
        prompt += "Competitor Data:\n"
        for i, company in enumerate(company_data, 1):
            prompt += f"\nCompetitor {i}:\n"
            prompt += f"  Name: {company.get('name', 'N/A')}\n"
            prompt += f"  URL: {company.get('url', 'N/A')}\n"
            prompt += f"  Description: {company.get('description', 'N/A')}\n"
            prompt += f"  Summary: {company.get('summary', 'N/A')}\n"
            if "metadata" in company:
                 prompt += f"  Metadata: {json.dumps(company['metadata'])}\n"
        prompt += "\nGenerate the analysis strictly in JSON format with keys: 'strengths', 'weaknesses', 'opportunities', 'market_gaps', 'pricing_strategies', 'growth_opportunities', 'recommendations'. Do not include any introductory text or explanations outside the JSON structure."
        return prompt

    def _parse_llm_response(self, response_text: str) -> Optional[Dict[str, Any]]:
         """Attempts to parse JSON from the LLM response text."""
         try:
             return json.loads(response_text)
         except json.JSONDecodeError:
             json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
             if json_match:
                 try:
                     return json.loads(json_match.group(0))
                 except json.JSONDecodeError:
                     print("Extracted text looked like JSON but failed to parse.")
                     return None
             else:
                 print("Could not find JSON structure in the response.")
                 return None

    def generate_analysis_report(self, company_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a detailed analysis report using the configured LLM"""
        if not self.client or not self.model_id or not self.api_key: 
            st.warning("LLM provider not configured correctly (check API key/model selection). Using mock analysis data.")
            return self._generate_mock_report()

        prompt = self._generate_prompt(company_data)
        analysis_json_str = None 
        
        try:
            print(f"Generating analysis using {self.provider} model {self.model_id}...") 
            
            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.model_id,
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"} 
                )
                analysis_json_str = response.choices[0].message.content
            elif self.provider == "anthropic":
                message = self.client.messages.create(
                    model=self.model_id,
                    max_tokens=3072, 
                    messages=[{"role": "user", "content": prompt}]
                )
                analysis_json_str = message.content[0].text 
            elif self.provider == "google":
                 response = self.client.generate_content(prompt)
                 analysis_json_str = response.text 
            elif self.provider in self.BASE_URLS: # DeepSeek etc.
                 response = self.client.chat.completions.create(
                      model=self.model_id, 
                      messages=[{"role": "user", "content": prompt}]
                 )
                 analysis_json_str = response.choices[0].message.content 

            # --- Response Parsing and Validation ---
            if analysis_json_str:
                 analysis_data = self._parse_llm_response(analysis_json_str)
                 if analysis_data:
                      required_keys = ['strengths', 'weaknesses', 'opportunities', 'market_gaps', 'pricing_strategies', 'growth_opportunities', 'recommendations']
                      if not all(key in analysis_data for key in required_keys):
                           st.warning("LLM response missing some expected analysis keys. Results might be incomplete.")
                           for key in required_keys:
                               analysis_data.setdefault(key, ["N/A"]) 
                      return analysis_data
                 else:
                      st.error(f"Could not parse valid JSON from {self.provider} response.")
                      print(f"{self.provider} Raw Response: {analysis_json_str}") 
                      return self._generate_mock_report() 
            else:
                 st.error(f"Received empty response from {self.provider}.")
                 return self._generate_mock_report() 

        except Exception as e:
            st.error(f"Error generating analysis report with {self.provider}: {e}")
            print(f"Error details: {e}") 
            return self._generate_mock_report() 

    def _generate_mock_report(self) -> Dict[str, Any]:
        """Generates mock analysis data"""
        print("Generating mock analysis report...") 
        return {
            "strengths": ["Mock: Strong online presence", "Mock: Innovative product lineup"],
            "weaknesses": ["Mock: Limited market reach", "Mock: Price point concerns"],
            "opportunities": ["Mock: Expand to new markets", "Mock: Develop budget offerings"],
            "market_gaps": ["Mock: Underserved budget segment"],
            "pricing_strategies": ["Mock: Consider freemium model"],
            "growth_opportunities": ["Mock: International expansion"],
            "recommendations": ["Mock: Develop a stronger social media presence"]
        }

# --- Comparison Agent (Unchanged) ---
class ComparisonAgent:
    """Agent that creates structured comparisons between competitors"""
    def __init__(self):
        pass
        
    def create_comparison_table(self, company_data: List[Dict[str, Any]]) -> pd.DataFrame:
        data = []
        for company in company_data:
            metadata = company.get("metadata", {})
            technologies = ", ".join(metadata.get("technologies", ["N/A"]))
            team_size = metadata.get("team_size", "N/A")
            founded = metadata.get("founded", "N/A")
            data.append({
                "Company": company.get("name", "Unknown"), "Website": company.get("url", "N/A"),
                "Description": company.get("description", "N/A")[:100] + "...", 
                "Summary": company.get("summary", "N/A")[:100] + "...",
                "Technologies": technologies, "Team Size": team_size, "Founded": founded,
            })
        if not data: return pd.DataFrame(columns=["Company", "Website", "Description", "Summary", "Technologies", "Team Size", "Founded"])
        return pd.DataFrame(data)

# --- Competitor Intelligence Team (Updated configure_agents) ---
class CompetitorIntelligenceTeam:
    """Main agent team that coordinates the specialized agents"""
    def __init__(self):
        self.firecrawl_agent = FirecrawlAgent()
        self.exa_agent = ExaSearchAgent()
        self.analysis_agent = AnalysisAgent() # Default init
        self.comparison_agent = ComparisonAgent()
        
    def configure_agents(self, llm_provider: str, llm_api_key: str, llm_model_id: str, firecrawl_key: str, exa_key: str):
        """Configure agents with API keys and LLM choice"""
        self.firecrawl_agent = FirecrawlAgent(firecrawl_key)
        self.exa_agent = ExaSearchAgent(exa_key)
        # Pass the actual model ID now
        self.analysis_agent = AnalysisAgent(provider=llm_provider, api_key=llm_api_key, model_id=llm_model_id) 
        print(f"Agents configured with LLM Provider: {llm_provider}, Model: {self.analysis_agent.model_id}") 
        
    def discover_competitors(self, input_text: str, is_url: bool = False) -> List[Dict[str, Any]]:
        """Discover competitors based on input (URL or description)"""
        # (Logic unchanged from previous version)
        if is_url:
            if not re.match(r'^https?://', input_text):
                 st.error("Invalid URL provided. Please include http:// or https://")
                 return []
            company_data = self.firecrawl_agent.crawl_website(input_text)
            description = company_data.get("description", "")
            if not description:
                 st.warning("Could not extract description from website for competitor search.")
                 description = company_data.get("title", "") 
        else:
            description = input_text
            
        if not description:
             st.error("Cannot search for competitors without a description or URL.")
             return []

        competitors = self.exa_agent.find_similar_companies(description)
        
        enriched_competitors = []
        progress_bar = st.progress(0.0, text="Crawling competitor websites...")
        num_competitors = len(competitors)
        if num_competitors == 0:
             progress_bar.progress(1.0, text="No competitors found to crawl.")
             return []
             
        for i, competitor in enumerate(competitors):
            name = competitor.get('name', 'Unknown')
            url = competitor.get('url')
            progress_text = f"Crawling {name} ({i+1}/{num_competitors})..."
            progress_bar.progress((i + 1) / num_competitors, text=progress_text)

            if url:
                try:
                    crawl_data = self.firecrawl_agent.crawl_website(url)
                    competitor.update({
                        "summary": self.firecrawl_agent.summarize_content(crawl_data.get("content", "")),
                        "metadata": crawl_data.get("metadata", {})
                    })
                except Exception as e:
                     st.warning(f"Could not crawl {name} ({url}): {e}")
                     competitor["summary"] = "Crawling failed"
                     competitor["metadata"] = {}
            else:
                 competitor["summary"] = "No URL provided"
                 competitor["metadata"] = {}
                 
            enriched_competitors.append(competitor)
            
        progress_bar.progress(1.0, text="Competitor crawling complete.")
        return enriched_competitors
        
    def generate_intelligence_report(self, competitors: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a complete intelligence report"""
        # (Logic mostly unchanged, relies on configured analysis_agent)
        if not competitors:
             return {"competitors": [], "analysis": {}, "comparison_table": pd.DataFrame()}
             
        if not self.analysis_agent or not self.analysis_agent.client:
             st.error("Analysis agent not configured. Please check API keys in sidebar.")
             analysis = self.analysis_agent._generate_mock_report() 
        else:
             analysis = self.analysis_agent.generate_analysis_report(competitors)
             
        comparison_df = self.comparison_agent.create_comparison_table(competitors)
        
        return {"competitors": competitors, "analysis": analysis, "comparison_table": comparison_df}

# --- Streamlit UI (Updated Sidebar) ---
def main():
    st.set_page_config(page_title="AI Competitor Intelligence Agent Team", page_icon="🔍", layout="wide")
    st.title("🔍 AI Competitor Intelligence Agent Team")
    st.markdown("Analyze your competitors and get actionable intelligence using AI agents.")
    
    # Initialize the agent team
    agent_team = CompetitorIntelligenceTeam()
    selected_model_id = None # Initialize
    keys_provided = False # Initialize

    # --- Sidebar Configuration ---
    with st.sidebar:
        st.header("API Configuration")
        
        # LLM Provider Selection
        llm_provider = st.selectbox(
            "Choose LLM Provider:",
            ("OpenAI", "Anthropic", "Google", "DeepSeek"), 
            key="llm_provider", index=0
        ).lower() 

        # --- Conditional API Key and Model Inputs ---
        llm_api_key = ""
        model_options_for_provider = list(MODEL_OPTIONS.get(llm_provider, {}).values()) # Get display names
        
        # Find default display name for the provider
        default_model_id = list(MODEL_OPTIONS.get(llm_provider, {}).keys())[0] if MODEL_OPTIONS.get(llm_provider) else None
        default_display_name = MODEL_OPTIONS.get(llm_provider, {}).get(default_model_id)
        default_index = model_options_for_provider.index(default_display_name) if default_display_name in model_options_for_provider else 0

        if llm_provider == "openai":
            llm_api_key = st.text_input("OpenAI API Key", type="password", key="openai_api_key")
        elif llm_provider == "anthropic":
            llm_api_key = st.text_input("Anthropic API Key", type="password", key="anthropic_api_key")
        elif llm_provider == "google":
             llm_api_key = st.text_input("Google API Key", type="password", key="google_api_key")
        elif llm_provider == "deepseek":
             llm_api_key = st.text_input("DeepSeek API Key", type="password", key="deepseek_api_key")
        
        # Model Selection Dropdown (Populated based on provider)
        if model_options_for_provider:
             selected_model_display_name = st.selectbox(
                  f"{llm_provider.capitalize()} Model:",
                  options=model_options_for_provider,
                  index=default_index, # Set default selection
                  key=f"{llm_provider}_model_select",
                  help="Select the model to use for analysis. Tiers indicate relative cost/performance."
             )
             # Extract the actual model ID from the selected display name
             selected_model_id = get_model_id(selected_model_display_name)
        else:
             st.warning(f"No predefined models found for {llm_provider}. Analysis may fail.")
             selected_model_id = None # Ensure it's None if no options

        # Other API Keys
        firecrawl_key = st.text_input("Firecrawl API Key", type="password", key="firecrawl_key")
        exa_key = st.text_input("Exa API Key", type="password", key="exa_key")
        
        # Check if all necessary keys are provided
        keys_provided = llm_api_key and firecrawl_key and exa_key and selected_model_id
        if keys_provided:
             st.success(f"All API keys provided ({llm_provider.capitalize()} - {selected_model_id} selected).")
        else:
             st.warning("Please provide all required API keys and ensure a model is selected.")

        st.markdown("---")
        st.markdown("### About")
        st.markdown("Provides competitor analysis using AI.")
        st.markdown("**Note:** Model tiers (e.g., Balanced, Fast) are relative indicators. Check provider websites for exact pricing.")

    # --- End Sidebar ---
    
    # Configure agents only if all keys and model are present
    if keys_provided:
        try:
            # Pass the extracted model_id
            agent_team.configure_agents(
                llm_provider=llm_provider, 
                llm_api_key=llm_api_key, 
                llm_model_id=selected_model_id, # Use the extracted ID
                firecrawl_key=firecrawl_key, 
                exa_key=exa_key
            )
        except ValueError as e:
             st.sidebar.error(f"Configuration Error: {e}") 
             keys_provided = False 

    # --- Main Page Input and Analysis ---
    st.header("Company Input")
    input_type = st.radio("Input type:", ["Company Website URL", "Company Description"])
    
    if input_type == "Company Website URL":
        input_text = st.text_input("Enter your company's website URL:", placeholder="https://example.com", key="input_url")
        is_url = True
    else:
        input_text = st.text_area("Describe your company:", placeholder="We are a tech company...", height=150, key="input_desc")
        is_url = False
    
    # Analysis button (disabled if keys not provided)
    if st.button("Analyze Competitors", type="primary", key="analyze_button", disabled=not keys_provided):
        if not input_text:
            st.error("Please provide either a URL or description.")
        else:
            st.empty() # Clear previous results
            with st.spinner(f"Analyzing competitors using {agent_team.analysis_agent.provider.capitalize()} ({agent_team.analysis_agent.model_id})... This may take a few minutes."):
                try:
                    competitors = agent_team.discover_competitors(input_text, is_url)
                    if not competitors:
                         st.warning("No competitors found or discovery failed.")
                    else:
                         report = agent_team.generate_intelligence_report(competitors)
                         
                         # --- Display Results ---
                         st.header("Competitor Analysis Results")
                         st.subheader("Competitor Comparison")
                         if not report["comparison_table"].empty: st.dataframe(report["comparison_table"], use_container_width=True)
                         else: st.write("No data for comparison table.")

                         st.subheader("Analysis Insights")
                         analysis_data = report.get("analysis", {})
                         if analysis_data and not all(v == ["N/A"] or v == [] for v in analysis_data.values()): 
                             col1, col2 = st.columns(2)
                             with col1:
                                 st.markdown("#### Strengths & Weaknesses")
                                 st.write("**Strengths:**"); [st.markdown(f"- {item}") for item in analysis_data.get("strengths", ["N/A"])]
                                 st.write("**Weaknesses:**"); [st.markdown(f"- {item}") for item in analysis_data.get("weaknesses", ["N/A"])]
                             with col2:
                                 st.markdown("#### Opportunities & Market Gaps")
                                 st.write("**Opportunities:**"); [st.markdown(f"- {item}") for item in analysis_data.get("opportunities", ["N/A"])]
                                 st.write("**Market Gaps:**"); [st.markdown(f"- {item}") for item in analysis_data.get("market_gaps", ["N/A"])]

                             st.markdown("#### Pricing & Growth")
                             st.write("**Suggested Pricing Strategies:**"); [st.markdown(f"- {item}") for item in analysis_data.get("pricing_strategies", ["N/A"])]
                             st.write("**Potential Growth Opportunities:**"); [st.markdown(f"- {item}") for item in analysis_data.get("growth_opportunities", ["N/A"])]

                             st.subheader("Strategic Recommendations")
                             recommendations = analysis_data.get("recommendations", [])
                             if recommendations and recommendations != ["N/A"]: [st.markdown(f"**{i}.** {rec}") for i, rec in enumerate(recommendations, 1)]
                             else: st.write("No specific recommendations generated.")
                         else:
                              st.warning("Analysis could not be generated or returned empty. Check API keys and LLM configuration.")

                         st.subheader("Detailed Competitor Information")
                         if report["competitors"]:
                             for competitor in report["competitors"]:
                                 with st.expander(f"{competitor.get('name', 'Unknown')} - {competitor.get('url', 'N/A')}"):
                                     st.markdown(f"**Description:** {competitor.get('description', 'N/A')}")
                                     st.markdown(f"**Summary:** {competitor.get('summary', 'N/A')}")
                                     metadata = competitor.get("metadata", {})
                                     if metadata:
                                         st.markdown("**Technologies:** " + ", ".join(metadata.get("technologies", ["N/A"])))
                                         st.markdown(f"**Team Size:** {metadata.get('team_size', 'N/A')}")
                                         st.markdown(f"**Founded:** {metadata.get('founded', 'N/A')}")
                                     else: st.write("No metadata available.")
                         else: st.write("No detailed competitor information available.")
                except Exception as e:
                     st.error(f"An unexpected error occurred during analysis: {e}")
                     print(f"Analysis Error: {e}") 

if __name__ == "__main__":
    main()