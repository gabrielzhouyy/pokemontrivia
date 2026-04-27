
  21. Login. Since it's just for your kid:                                                                          
  - (a) Username + simple PIN (e.g. 4 digits): This
  - (b) Just a name, no password (anyone on the device can play as them)                                            
  - (c) Multiple kid profiles supported (in case sibling/cousin)        
                                           
  21. Where does data save?                                                                                         
  - (a) Browser localStorage only (lost if browser is cleared, no cross-device)                                     
  - (b) Tiny backend with a database (saves across devices, you'd need a host)                                      
  - (c) Start with localStorage, add backend later: This
                                  
  21. Battle/encounter framing. When they tap a Pokemon in the Pokedex grid, what do they see?                      
  - (a) Cinematic encounter: "A wild Pidgey appeared!" → Pokemon sprite bounces in → question pops up: This, but if already caught, it should show training...
  - (b) Direct: Tap Pokemon → question modal pops immediately                                                       
  - (c) Card flip: Pokemon shown as silhouette/card, flips to reveal + question                                                                 
  21. Question variety per Pokemon. When they answer a question for, say, Pidgey:                                   
  - (a) Same Pokemon = same question pool reshuffled each time                                                      
  - (b) New random question every time (from that tier's pool)                                                      
  - (c) Adaptive: misses come back later (spaced repetition — best for learning)     : This                                                       
  21. Anything you want me to NOT do? E.g. no ads, no microtransactions feel, no scary/dark Pokemon imagery, no time pressure on questions, etc.     

All ok, time pressure can be set later based on rarity