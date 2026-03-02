# The Semiotics, Sociolinguistics, and Computational Processing of the Phatic Greeting "Hi"

### Key Points
*   **Phatic Function:** The word "Hi" functions primarily as a phatic expression, meaning its utility lies in establishing social contact and maintaining rapport rather than conveying semantic information [cite: 1, 2].
*   **Computational Intent:** In Artificial Intelligence (AI) and Natural Language Processing (NLP), "Hi" is categorized under specific intent classifications (often labeled `greeting`), requiring algorithms to distinguish it from actionable queries to trigger appropriate conversational workflows [cite: 3, 4].
*   **Social Lubricant:** Research suggests "Hi" serves as a universal conversational opener that reduces social tension and signals approachability, though its appropriateness varies significantly based on hierarchy and register (e.g., casual vs. professional settings) [cite: 5, 6].
*   **Human-Computer Interaction (HCI):** Recent studies indicate that initiating interaction with AI using polite greetings like "Hi" (the "politeness effect") may yield more contextually accurate and detailed responses from Large Language Models (LLMs) [cite: 7].
*   **Etymological Roots:** The term evolved from Middle English "hy" or "hey," demonstrating a linguistic consistency in informal greetings across centuries [cite: 8].

---

## 1. Introduction: The Complexity of the Minimalist Greeting

While seemingly simplistic, the monosyllabic greeting "Hi" represents a complex intersection of human social psychology, linguistic evolution, and modern computational understanding. It is a fundamental unit of **phatic communion**—speech employed to establish social bonds rather than exchange information. In the digital age, "Hi" has transcended human-to-human interaction to become a critical data point in Natural Language Understanding (NLU), serving as the "handshake" protocol between humans and machine intelligence. This report analyzes "Hi" through three distinct lenses: its sociolinguistic function in human interaction, its processing within AI architecture, and its evolving role in digital communication standards.

## 2. Linguistic and Etymological Foundations

### 2.1 Etymology and Evolution
The word "Hi" acts as an interjection derived from the Middle English terms "hy" or "hey" [cite: 8]. These precursors share roots with the Old English "hīg," suggesting that the phonetic structure of the greeting has remained relatively stable despite the evolution of the English language [cite: 8]. Historically, the term functioned to attract attention or express surprise, similar to the modern "hey," before solidifying its role as a standard informal greeting [cite: 9, 10].

In contemporary usage, "Hi" is widely recognized as a shortened, more casual alternative to "Hello" [cite: 10]. While "Hello" may sound stilted or overly formal in certain modern contexts—particularly in digital messaging—"Hi" has emerged as a versatile standard capable of bridging the gap between familiarity and professional courtesy [cite: 10].

### 2.2 Phatic Communion and Semantics
In linguistics, "Hi" is the quintessential example of a **phatic expression** [cite: 1, 11]. Coined by anthropologist Bronisław Malinowski and further developed by Roman Jakobson, the term "phatic" describes communication aimed at establishing or maintaining social relationships rather than imparting semantic content [cite: 1, 2].

When an interlocutor says "Hi," they are not conveying factual data about the world; rather, they are signaling:
*   **Presence:** Acknowledging the existence of the other party [cite: 8].
*   **Channel Openness:** Indicating a willingness to engage in further communication [cite: 5].
*   **Societal Compliance:** Adhering to the "unspoken laws of social exchange" that dictate polite acknowledgement before transactional discourse [cite: 2].

The semantic value of "Hi" is negligible, but its **socio-pragmatic value** is immense. Omitting this phatic token—for example, launching directly into a request without a greeting—is often perceived as hostile or socially inept [cite: 2, 12]. This functions similarly to non-verbal cues like waving or smiling, serving to regulate conversation and manage interpersonal distance [cite: 1].

### 2.3 The "Anti-Idiomaticity" of Greetings
Interestingly, constructed languages and logical systems sometimes struggle with the redundancy of phatic expressions. In the minimalist language Toki Pona, phatic expressions are often discouraged or viewed as "anti-idiomatic" because they do not convey literal meaning [cite: 13]. However, in natural languages, this redundancy is a feature, not a bug; it acts as a "social lubricant" that reduces the friction of initiating interaction [cite: 5].

## 3. Sociolinguistic Function and Register Analysis

### 3.1 Hierarchy and Register
The usage of "Hi" is dictated by social register—the level of formality required by the context.
*   **Informal Settings:** "Hi" is the default greeting among friends, acquaintances, and family members [cite: 9]. It implies a level of equality and reduced social distance [cite: 14].
*   **Professional Settings:** "Hi" has largely supplanted "Dear [Name]" in modern office email culture. It is considered the "standard greeting for office e-mails," striking a balance that "Hello" (too formal) and "Hey" (too casual) often miss [cite: 10].
*   **Hierarchical Constraints:** Despite its ubiquity, "Hi" may still be considered inappropriate in strictly vertical hierarchies or solemn occasions. For instance, greeting a high-ranking superior or a grieving individual (e.g., at a funeral) with a casual "Hi" or "Heya" violates social protocols regarding respect and solemnity [cite: 14].

### 3.2 "Hi" vs. "Hey" vs. "Hello"
The nuance between these variants is significant:
*   **"Hi":** Informal but polite; suitable for colleagues and acquaintances [cite: 14].
*   **"Hey":** Originally a call for attention (e.g., "Hey! Come here!"), it has evolved into a very casual greeting. It is generally reserved for people already known to the speaker or peers of the same age/status [cite: 10]. Research indicates that younger demographics (under 35) increasingly use "Hey" as a default, while it may be perceived as too informal for initial professional contact [cite: 10].
*   **"Hello":** The most formal of the triad, often reserved for answering telephones, addressing strangers, or situations requiring distinct clarity [cite: 14].

### 3.3 Cultural Variations
While "Hi" is English, the concept of the informal phatic greeting is universal, though its execution varies. In Spanish ("Hola") and French ("Salut"), similar informal markers exist to set a warm tone [cite: 9]. However, cultural norms dictate the accompanying non-verbal behavior. For example, in many Asian cultures, verbal greetings are often accompanied by bowing or specific gestures to denote respect, adding a layer of physical phatic expression absent in the purely verbal English "Hi" [cite: 6].

A study comparing greeting patterns between participants from Israel, Taiwan, and the US found that while "Hi" and "Hello" are conventionalized, the frequency and type of phatic openings differ. For example, Taiwanese participants in English correspondence occasionally omitted greetings entirely or used "Dear," reflecting a transfer of formal letter-writing norms into digital spaces, whereas native US speakers utilized "Hi" as a standard oral and written convention [cite: 15, 16].

## 4. Computational Linguistics: Intent Classification

In the realm of Artificial Intelligence, "Hi" transforms from a social gesture into a classification challenge. Natural Language Understanding (NLU) systems must recognize "Hi" not as noise, but as a specific **Intent**.

### 4.1 Defining Intent Classification
Intent classification is a supervised machine learning task where text inputs are categorized into predefined groups based on the user's goal [cite: 3, 17]. When a user inputs "Hi," the AI must map this string to a label, typically `greeting` or `welcome_intent` [cite: 4].

This process involves several stages:
1.  **Preprocessing:** The text "Hi" is tokenized (broken down), lowercased ("hi"), and cleaned of special characters [cite: 4].
2.  **Feature Extraction:** The model analyzes the linguistic features. For a short string like "Hi," the system relies on exact matching or vector similarity in a high-dimensional space [cite: 4].
3.  **Classification:** The model calculates a probability score. If the input strongly correlates with training examples labeled `greeting` (e.g., "hello," "hi there," "good morning"), it assigns the `greeting` intent [cite: 3, 4].

### 4.2 Algorithms and Models
Modern systems use various architectures to process this:
*   **Rule-Based Systems:** Simple scripts that look for keywords. If input == "hi", then output "Hello". These are fast but brittle [cite: 17, 18].
*   **Deep Learning (Transformers/BERT):** Advanced models like BERT (Bidirectional Encoder Representations from Transformers) analyze the context. While "Hi" provides little context on its own, these models are fine-tuned to recognize it as the start of a sequence [cite: 4, 17].
*   **Probability Scores:** The model assigns specific confidence levels. An input of "Hi" might return: `{intent: "greeting", confidence: 0.99}`. If the confidence is too low, the system triggers a fallback or "Unknown" intent [cite: 18].

### 4.3 The "Greeting" Intent in Customer Service
In business applications, accurately classifying "Hi" is crucial for customer retention.
*   **The First Impression:** Automated systems (chatbots) use the greeting intent to trigger a "Welcome Message" [cite: 19].
*   **Routing:** Identifying a greeting allows the system to pause and wait for the actual query, or to proactively offer menu options (e.g., "Hi! How can I help you with your order?") [cite: 20, 21].
*   **Entity Extraction:** While "Hi" itself contains no entities (like dates or locations), it often appears in compound sentences: "Hi, I need a flight to London." Here, the NLU must classify the intent (Book Flight) *and* recognize the greeting as a phatic wrapper [cite: 3, 4].

## 5. Human-Computer Interaction: The "Politeness Effect"

Recent research into Human-Computer Interaction (HCI) has uncovered a phenomenon where treating AI agents with social norms—such as saying "Hi"—improves performance.

### 5.1 The Role of Greetings in Prompt Engineering
Research from 2024 and 2025 suggests that users who employ structured, polite greeting patterns (e.g., "Hi, could you help me with...") receive responses that are approximately **30% more detailed and contextually appropriate** than those who use abrupt prompts [cite: 7]. This is known as the **"Politeness Effect."**

### 5.2 Why "Hi" Improves AI Output
Although AI systems do not possess feelings, they are trained on vast datasets of human conversation where polite interactions typically yield high-quality, helpful responses. By using "Hi," the user sets a "conversational context" that aligns with high-quality training data (e.g., helpful customer service transcripts or tutoring sessions) [cite: 7, 22].

*   **Tone Setting:** The greeting helps the AI infer the user's communication style. A polite "Hi" signals a cooperative interaction, whereas an abrupt command might align with different, less verbose training examples [cite: 7].
*   **Contextual Awareness:** NLP algorithms use the greeting to establish the start of a session, clearing previous context variables and preparing the "context window" for new information [cite: 21, 22].

### 5.3 Automated Greetings and Chatbots
On the flip side, AI systems are programmed to generate greetings to engage users. Static welcome messages ("Hi there! I'm Ava...") are designed to:
1.  **Set a Positive Tone:** Mimicking human friendliness to build trust [cite: 19].
2.  **Define Purpose:** Immediately framing the bot's capabilities [cite: 19].
3.  **Encourage Interaction:** A pop-up "Hi" widget on a website can significantly increase user engagement rates [cite: 23].

## 6. Psychological and Social Implications

### 6.1 The Psychology of Acknowledgement
At its core, "Hi" is a validation of existence. Psychologists suggest that even brief verbal acknowledgments reduce social tension and increase trust [cite: 6]. In a world that often feels disconnected, the "micro-interaction" of a greeting serves as a "social lubricant," allowing strangers to interact without hostility [cite: 5].

### 6.2 Digital Communication and Mental Health
In digital environments, the presence or absence of "Hi" carries weight. A text message lacking a greeting can be perceived as cold or angry, depending on the relationship. Conversely, the use of "Hi" in digital correspondence (emails, DMs) provides an immediate sense of approachability [cite: 6]. For individuals with autism or social communication difficulties, understanding the phatic necessity of "Hi" can be a specific area of learning, as the word serves a social function unrelated to its literal meaning [cite: 12].

## 7. Conclusion

The word "Hi" is deceptive in its brevity. Linguistically, it is a robust survivor of the English language's evolution, maintaining its form from the Old English "hīg." Socially, it is the primary instrument of phatic communion, essential for initiating the cooperative framework required for human interaction. Technologically, it is a critical intent classification label that enables machines to recognize the start of a human interaction, influencing the quality of AI-generated responses through the politeness effect. Whether spoken to a neighbor or typed into a chatbot, "Hi" remains the fundamental protocol for opening the channel of communication.

---
### References
*   [cite: 3] QuestionPro. (2022). *NLP intent classification for greetings*.
*   [cite: 4] Avahi. (2025). *Intent Classification*.
*   [cite: 17] Label Your Data. (2025). *Intent Classification in NLP*.
*   [cite: 20] Innovatiana. (2024). *Intent classification for AI*.
*   [cite: 18] Vega IT. (2023). *Intent classification: Understanding text with the power of AI*.
*   [cite: 8] The Dictionary Fandom. *Hi*.
*   [cite: 5] Gambia College. (2025). *Is Hi a Word? Meaning, Usage, and History Explained*.
*   [cite: 6] RipnHits. (2026). *Hi*.
*   [cite: 9] The Language Library (YouTube). (2025). *What Is The Meaning Of Hi?*
*   [cite: 24] Lemon8. (2024). *The word "hi" is one of the simplest yet most powerful forms of communication*.
*   [cite: 1] Wikipedia. *Phatic expression*.
*   [cite: 11] Merriam-Webster. (2010). *Phatic*.
*   [cite: 13] Sona Pona. (2024). *Phatic expressions*.
*   [cite: 2] Katrina L Translation. (2023). *Translating Phatic Expressions*.
*   [cite: 12] Actually Autistic Wiki. (2022). *Phatic expression*.
*   [cite: 7] FlowHunt. (2025). *How to Greet AI Chatbot*.
*   [cite: 22] My AI Front Desk. (2024). *Beyond Hello: The Hidden Complexities of AI-Human Greetings*.
*   [cite: 19] Chatbot Builder AI. (2026). *Crafting the Perfect AI Chatbot Welcome Message*.
*   [cite: 21] Dante AI. *How AI Chatbots Work*.
*   [cite: 23] ChatBot. (2025). *Widget Greetings*.
*   [cite: 15] British Journal of Multidisciplinary and Advanced Studies. (2024). *Making conversation for the sake of it*.
*   [cite: 16] ERIC. *Phatic Communication in Online Learning*.
*   [cite: 10] English Stack Exchange. (2014). *Difference between using Hi and Hey*.
*   [cite: 25] Jurnal UBD. *Greetings after an Introduction*.
*   [cite: 14] Quora. (2012). *What is the difference between "hi" and "hello"?*

**Sources:**
1. [wikipedia.org](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHZw1e-hjaepmKhjcxjiLbHN-IqWb84bbTzKVy27iK9rvTwq0ynliSj1O7Ti0WPLFYLaKqJzmiKzyJn7kCo-da8-tkZ9agcpbuU0CIiY8qEwAgorOEn50aUD7KnBBv1GifiwRkoWQ==)
2. [katrina-l-translation.online](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGgM2q8cjw_XnSP7YaFIeKjUe_TcOWyZT3LOwkwDjdrBXOtMsYHw0LtziQNuF8CGXWhsUZ9ExMIChebs0xoFhjnlTv4jBJpQGA-GO7jeCrW3z1Eo8jzcjOgOxE0A5RBb0xpOWmINSIfTphksddFkWLVXwMOv5hf0dUBYB-tXSxtRcL8T2Se)
3. [questionpro.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG54F6d7xRVX3ItkT5fTtcwXvXTYddMzdQVGZcMdlEj16K_hPRBSXiYQIQpdtJj-Un-28HL61N7GEX4ssCspkEIz6Ma0eVTKpMTsD1OM8zuaxewG1IFTZtVFfocMCygJ2o3XN4slVNq9fjlw3E8)
4. [avahi.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEp6RQKMJQvDwEC1tXWV8HFyXXk4mSVqRzi4RxaloB3HYPdjGalNu3UuxKDPWomnI9_irRk0S59nV6_0saEX0TeEbsGxZFkqIZy01QTTf_8hGfsK8ILs5gxw94AeXjkpJzoZsjj9ns=)
5. [gambiacollege.edu.gm](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFM-sfuYoHW9sULAthB7caM5ORo8N7NLs5VVqcuPftoGv9rDo1OlH-eJMXOha_lwOnpPelFncwZgCxmLMbtCaHp13uLk3_-0HNAcsc1Rw97686O0qyiW08w_KYypnjLlLYZh1FwE2497rU70MUKBEKmFLyJVZuLroLqmkVWsQnpMMeqeUaFwkTcN69p5OAmqf6ReLGmlo_X)
6. [ripnhits.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFVuN-QK-VlYnyzXEk2DE74pFImmAtH8ODmel8HZSqvQ6IAZ7dFBtBE4Egu5uU4DrsE7QNoDBgK3aA2GaFAq_3Uc4E5cIC96AfnaesZBtR7SPb_ZboDlR6xJA==)
7. [flowhunt.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGKxLOVydH-Fxlu-_MK-NYwFq-gqYT1zcctHsaHYqtshSKKWw2lnA9hTkUJLL4n3T97V0oUwM4R3GCCdPAjSuhrlamks-CIY_UB7wbd8IVArY5a3IdYFzTqyypvitWlS6cEqAwy5gs9X_5z)
8. [fandom.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFyX9dDWjR7zOBtJpVVaJuPZgjomGxw69fBLQ6hQdxxx-QI93SgzlzUlLnhZWqXDH9Uxrna5Xnyrc_Hv8s3SUE76E--FSbWhFP6vEJTun8YjsUjVAzT_qDBGiRaD9ojDQ==)
9. [youtube.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHypRkLCnnKVPsVIuTj8yjmZBlc_9uEeE65gDErdVQd694VO_YlTly_VWU-976CyUvBuE02y_RG8E4z7lRocn1_QAFTK8uYA_8zmdvZ5EBW7wR13iYduzc0fcthS9XHjX6H)
10. [stackexchange.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGh7lz2zuDe49Xd5mhRIrYjoP2Z5aLzMgb8oYxCrUWPqGqphLiK4xIcPTJ2imXVZzshlPqlYLPSc2wHjB0ZnkYMon0TBJZlKXO9iKyWTytFgs3dP3pDuw2a2kREXglE6pM4uC6WZKyeijQbvRQ52kvIHTe4Ch6hCLGM4DLvr6oU75E20QUzhZdzioC1Mg==)
11. [merriam-webster.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGYJ8a_CagW18IboHL8pPdXsVtIOp-K5c3Q-PuYrtB4ujYHRl2OQNRkBif9DXVXBhNd9wE2Mm20CQq0EamgQRmBDeWzKkXOZEO8TmlabVmqxTnUOeTd-FY4zOhTGQcfXpPGOJrVFZGt)
12. [actuallyautistic.wiki](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQErbE0PvU_ta-UPs-Gm68d2DIB5GDyRqtucv6WhRIyo7FJm6CTU6Krl0mITW0v_7qaMRZp6rfo3goIiyOIPjpovxLDDhyraTHTtfU6eF9dOZplI_Of750hmFlyoBGNTXPvlOy1e-TplcXZZ)
13. [pona.la](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHxRGdNmAlwLD74QoWqLmVjB5jC-0POtoPvXgF6mTiebYU8robjyBfhsHcytr0YrsXpnz6a4TnP8AVtEhuC71uNQXIF9jcKqeMgGwxBv5gsbyLJ1-vKD0_tyNyLaDuGJRWdaw==)
14. [quora.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQERYH09WWMVJ-GS84EZdtXtKUwC2er1fJiuJW0YnMc8H_1Nf7KqCfFKqIMdiojauPXCfQjRXdLbSAts5B5nDv2-zbeaaVvjfGIxSXt2BlnOgwBemXlczGahZ-QgW75BoXx51hN1wWRpkRX_b7mItdZwmnWUXU2rQQ==)
15. [bjmas.org](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGguQNxWCqy0w0q8CkTZeIpL5YHcXMyPH1ekcHPnQmvoVo-sHpcpPU0KO8_Okft2yiumRtT35fBJ5Ztti2Rq3dgl8pbf0TLUuInlSFk5Tw5ZsmBhXqzj0jHGtDZ5fQnCT6NZTSMbMUYKLOxgBvZQ3XKA0Kifmu4Qg==)
16. [ed.gov](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFaANbb_7J3YsRnSDljV4z9CsO3-j0gghWd0d2h7vrUKTw3yM5AAvMYXYXU3xwQ3HHJhdFQtacpMl2QcRaX_UcMlClokJ4iP6IXDy640McNcx5eSJerCbXJULRj-EZScHd_qsOKSOs=)
17. [labelyourdata.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEZpkctqxqthbPjVh6m47IspD3yq7RaGA1BXSgHbTiAr9629rFOjGq6onT7HccgeVMF0sW5oOBYNaJI3Rws-AnNMjZ0u-zg5fvRJpLFK93xjUY6DcL4-otKhLrcRV-ra8fkv67MZgn4fe1FJ6VDTzwcYJxvQDXfjgo86HcSsw6h)
18. [vegaitglobal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEF0KtcnOv8fWUJsBKGyMhsHU2kIzkdri0rxTwKKH5RLN7ZC4uKJ4mxahk3gXjiU1w9uWMcY3fZMiJpWuxvcazjGEjNnOX-jRJGoqJLVqUpS85yeEUuXrYmXMrDA1UIS3cW8zT7q8aiQoplOXYH05AJyDdoI7hg2AWZvb5i2Wg0VRBzZJBZhDa5GkCp-OI0r4LNPUMyHG2OIicfPCqdLdNgff0YWrYeqiZiaWOT)
19. [chatbotbuilder.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGKQbxY5SIyPwT8pnAFb5NlnfDVoYvDPhPLXOhG4MFkacPfVnnILmjTp9Ug6TE5lMsTyJgI7UWTSs_yFmINfLLnjpnjJoXKdUWb9YOLyJizSL_7_7sEWPYEwiPq2QdH91xdcS_CfmzVdu2AmBuKUuC_GgfyAtgeYa9Esu-ehh7mJWzGp8FdqdNodJzIqJZGXhK99skvhA5dsM-XGxjA)
20. [innovatiana.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEy-YWQOVu3IhXt6uRzqf1BY3vttuQRTfMW6poZgzKD91drtDaiIRszsbSvCHGEjpH7z7qEfKGzSuBLkh0So6iOVePezWMRNbvitmDk9ezVtgxxSPt92sgOdFNCUSfMqV2erZyGiXz_biclBn6I3XodGpY4CPk9)
21. [dante-ai.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEdCM8rzHNsL06Ebro-Ydk2l_GUs0ExdFHi0K6lFBctHsid580p1S0ACiv7_d4-ZGYDl26W_LNpJ8p_YpsHyQXiKV77k_A_2rUPsiIuMiKTmH6_a50j_PK4DUlOhTKM-zu7xi0XKnoBnJKLrgjsWhrXzouD8C_32z-QnxSX2Q==)
22. [myaifrontdesk.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHr8VSTBwtNsSvq4vuwXr4GmCJn69XCprn1qKxW4Jko4SYjPPBtbjdgx5vpFcFMxF0-nyHnAg0TF8bkvsBBKu9ZbnWev17fbOxrm0i0qDcirWN0jk0aWnypiCRLjypZYTPVG8BEYtimO2HrezVFf4Ntl-nWf175qAShCV9FtNGpkogwi2nrqaSObWy8s4oktiQdDDZi)
23. [chatbot.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH-_NFM83m3Bgg9kXwowx4tCkoUJTmuHYYnUMnt08OosKLNMpBArVIe8JT6ervwK_Q0zvZdVZq49MRXJgj2ybeZ3884QNWwX4JB1tFYF_FapEKh-alytmWwve9L08nPOk6IgoyjWk9mrnzpOdx7Tmro)
24. [lemon8-app.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEe74dvBh0w85rqMKTSRH-RCfNqHi_f3aVABQWXXrN9SuviauYOm6fct2SO9kwaJBHHjAHXnUyzvJSYJCHjxmq-14JHLouqJcFSCNM-DbjkMszzaAWeTqVpuRrcXS3q8OIztcIhBq0szqxsh58SOlaF8KnJwS2qYp9bbAkz)
25. [ubd.ac.id](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHZ_Lzz9QEZPtIQjEjoq3Z9Pc2jupNvRcbYIbkbY_HI5NGTXMRCmhpflbrmoQ2ZzwWSD_p9u0g3bPlTVT_qgc-_kdNIBALA8MOTPg5bDUSsRJaYm106IL9f4SMuk48quj_X93axo5WlwS1dhsUn8Gr29AXLRtO9MTPbvA==)
