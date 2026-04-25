 A — Learning quality (most pedagogically important)                                            

  1. Right now, after a wrong answer, the modal shakes and reveals the correct answer. Should it 
  also:                                                                                          
    - (a) Briefly show why (e.g. "9 - 4: count back 4 from 9 → 8, 7, 6, 5") for a 7yo's learning,: 
    - (b) Force the kid to retype/reclick the correct answer once before moving on,              
    - (c) Just keep it as-is (current behavior is fine)?        : This                                 
  2. Skill targeting. Currently each tier mixes addition + subtraction + skip-counting in one    
  pool. Would you like:                                                                          
    - (a) A "skill of the day/week" admin setting — e.g. "this week, only multiplication"        
    - (b) Per-Pokemon skill (Pikachu always asks multiplication, Pidgey always addition)         
    - (c) Adaptive — the game detects what they're missing and surfaces more of it               
    - (d) Leave it mixed : Leave it mixed                                                                        
  3. Question variety beyond arithmetic. A 7yo also benefits from word problems, comparisons     
  (>/<), patterns, telling time, money. Add any of these to v2? Which?
  - I want to add spelling also, Money, chinese etc. But i also want to be able to control the mode. Im not sure if it should be pokemon specific or mode specific. Perhaps we can go by versions? first 151 pokemon is Gen 1, we can make that math. Gen 2 could be English, Gen 3 could be someting else. But for now, divide the 151 pokemons into math, english and chinese evenly.Would this make sense in therms of user flwo?                         

  B — Engagement & feel                                                                          
  
  4. Time pressure. Spec defers this; you said legendaries should have a timer later. Want me to 
  add it now, or wait until your kid masters the basics?  : Not now                                       
  5. Daily quest / streak. "Catch one new Pokemon today" or "10 correct in a row" daily challenge with a bonus reward? : Not now                                                                   
  6. Sound / music. Right now WebAudio synthesizes blips. Want to swap in real Game Boy Yellow chiptune .mp3 files? (I'd need you to confirm you have rights to whichever audio you use.): Ok
  7. Animations. Worth adding a Pokeball-throw animation between question and catch result (~1.5s polish)? Or stay snappy? : Stay snappy for now.                                          
  C — Content & scope                                   
                             
  8. Beyond Gen 1. Add Gen 2 (100 more Pokemon)? When? : Not now
  9. Item / Pokeball variety. Right now there's no inventory. Want to introduce "Great Ball" /   "Ultra Ball" rewards from streaks that give extra catch attempts?: Nope
  10. Battle mode (the spec says deferred — re-confirming you don't want this for v2 either?). Nope. 
  D — Admin & content pipeline                                                                   

  11. LLM question generator. Spec says you'd run a Node script that calls Claude to       batch-generate questions. Want me to build that next so you can refresh question banks easily?(Needs an Anthropic API key.): Not now.                                                                 
  12. Per-skill overrides. Should the admin config let you say "for my kid, skip 1×/2× tables —  they already know those, focus on 5× and 10×"? - not not
  E — Multi-device / multi-user                                                                                             
  13. Backend sync (spec phase 2). Worth doing now so progress survives clearing the browser, or wait?  : Yes, if doing so, use postgresdb and fastapi   if needed                                                                                     
  14. Sibling profiles. Will another kid eventually use this? (Affects whether we add profile  picker now.)  Yes.                                                                              

  F — Quality / robustness                                                                       

  15. Sprite preloading. PokeAPI sprites are loaded lazily — fast on the first fetch but
  flickery. Worth preloading the visible grid?                                                   
  16. Offline support. PWA / installable to the iPad home screen? Big win for kid usability if she plays on a tablet.    Can we just serve on webapp on ipad?                                                                     
  17. Accessibility. Larger tap targets, dyslexia-friendly font, screen-reader labels?
 
  ---                                                                                            
  My questions for you

  To get this into a concrete iteration plan, please answer these 4:                           
 
  18. Top 3 priorities from the list above (e.g. "1, 11, 16")?  : You help me priorotise based on my answers                                  
  19. Time horizon: how soon does your kid start using it seriously? (today / this weekend / this month) — affects whether we polish or ship rough.  Its ok, he is very happy with current state. Now its just about making sure its hosted, database is persistant, etc, we can access outside of home                                         
  20. Cadence: do you want one big v2 release, or weekly small drops?   Smalle drops                           
  21. Anything she's said or you've noticed during the v1 demo that surprised you (good or bad)? Assume if i never say its bad, its good and please keep it.    One thing we need is that we do not know the lvl of the pokemon when training it, we have to exit question mode to see it.                 
  Once I have those, I'll write a phased iteration plan (v2 / v3 / backlog) and we can pick the v2 scope.                                   