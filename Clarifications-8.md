  Q3 — Default subject ranges?                                                                           

  Want me to pre-fill the config like this, then you tweak?              Answer: Yes                                
  - Math → Pokemon #1–50                                                                                 
  - English → Pokemon #51–100                           
  - Chinese → Pokemon #101–151                                                                           
                                                        
  Or different boundaries? You can shift them in the config any time.                                   
  Q4 — Tiers per subject                                                                                 

  Math today has 4 tiers (easy → very hard) and tier is decided by Pokemon strength (legendary = tier 4, 
  etc.). Two ways to handle English/Chinese:                                                             
     
  - (a) Same 4-tier-by-Pokemon-strength model — all subjects share the difficulty mapping. So Caterpie   always = "easy" (math: 1+1, English: spell "CAT", Chinese: 一 二 三), Mewtwo always = "hard" (math:
  7×8, English: "cinnamon", Chinese: 龙).                                                                
  - (b) Per-subject custom tier mapping — admin can say "for English, Bulbasaur is tier 2 instead of     
  tier 1." More config work but full control. 
     
  I recommend (a) for now — it's simpler, and your existing Pokemon-tier file just gets reused. If youlater want per-subject tiers, the config schema supports it.           Answer: Agreed                                
  
  Q5 — Initial English & Chinese question banks                                                          
                                                        
  I'll seed small starter banks (~30 questions per tier per subject = ~120 each). What level should I aim for?                                                 

  - English: Tier 1 = letters/CVC words ("CAT", "DOG"), Tier 2 = sight words ("the", "and"), Tier 3 =  spelling 5–6 letter words, Tier 4 = harder spelling/grammar.
  - Chinese: Tier 1 = numbers/basic characters (一 二 三 大 小), Tier 2 = common words (你好 谢谢), Tier 3 = ~20-character recognition, Tier 4 = simple sentences.                  OK? Or your kid is at a different level — adjust how?      Ok

- One other tweak: After evolution, the main page pokedex should still remain the same picture, not the evolved stage. For example, after bulbasur evolves, it should not be ivysaur in pokedex 001. Also, after evolution, bulbasuar should not be clickable anymore, we will only be able to click ivysaur. 