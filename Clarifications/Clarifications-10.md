Admin User Flow
1. When logged into Admin:
	1. Users tab:  I see each player. This is correct now, 
		1. allow me to delete user.
		2. Age should be dropdown
	2. Subjects tab: 
		1. There are two inputs for subject that means the same: E.g. {math, Math, 1,50} for the math subject range. one of math or Math is enough. Make it a dropdown. There will be 4 subjects: Math, English, Chinese and General. General will replace Ad-hoc. 
		2. The Save button can be just "Save" instead of "Save (live)"
		3. No need to export subjects.json.
		4. Fallback is also a dropdown
	3. For ad-hoc questions tab:
		1. I want this to be a question bank selector instead
		2. Do not need import JSON tab
		3. How this works:
			1. Admin can create a bank of questions. Identified by name: for eg. Bank A
			2. The questions within can be selected by the overall bank of questiosn via dropdown(so we do not need to individuall create all), or free to create.
			3. Instead of tagging to the age, we tag the bank to an exisiting user.

	4. Remove export tab