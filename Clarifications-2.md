  - Player: Simple login for your 7yo, progress saved
  - Math: LLM-generated questions + admin upload option                                                             
  - Difficulty: Pokemon-driven (rarer/stronger = harder)                                                            
  - Platform: Web browser                                                                                           
  - Scope: Gen 1 (151)                                                                                              
  - Build: Playable prototype first, refine after                                                                                                                   
  Round 3: Core gameplay mechanics                                                                                  

  7. Question format. For a 7yo on a browser:                                                                       
  - (a) Multiple choice (tap/click answer) — fastest, no typing
  - (b) Type the answer with a number pad — more like real math                                                     
  - (c) Mix depending on question type : this                        

  7. What happens when they get it wrong?                                                                           
  - (a) Pokemon escapes, try again later                                                                            
  - (b) They get another try (2-3 attempts) : this, each attempt is akin to a catch attempt                                                       
  - (c) Show the correct answer, teach, then move on — no penalty                                                   
                                         
  7. Catching mechanic. You said "answer to catch." Is it:                                                          
  - (a) One question = catch (simple) - if correct =catch                                                                              
  - (b) Pokeball throw mini-game where correct answers = better throw                                               
  - (c) Multiple questions in a row (like a "battle") to wear the Pokemon down                                      
                                                                                                                    
  10. Evolution training. You mentioned training to evolve. How many correct answers should it take?                
  - Quick (~5 questions)                                                                                            
  - Medium (~15-20)                                                                                                 
  - Long (~50+ like a real game grind) : each answer correct = grow 1 level, upon correct level, pokemon evolves. For .g. chameleon at lvl 16.                                                                          
                                                                                                                    
  Round 4: Admin & content                                                                                          
   
  11. Admin access. Should "admin mode" (where you upload questions) be:                                            
  - (a) A separate admin URL/login just for you: 
  - (b) A hidden button in the main app                                                                             
  - (c) A config file you edit directly: this
                                          
  7. LLM questions — when generated?
  - (a) On-demand each time a Pokemon is selected (needs internet + API key)                                        
  - (b) Pre-generated in batches and stored (works offline, cheaper) : this                                            
 
  7. Pokemon sprites. Do you want me to:                                                                           
  - (a) Use the free PokeAPI sprite URLs (official art, no hosting needed): this                                 
  - (b) You'll supply custom art                                                                                    
  - (c) Placeholder shapes for now, swap later 