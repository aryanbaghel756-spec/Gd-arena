import time
import json
from typing import Optional, List, Dict
from .models import (
    TurnDetail, NextTurnResponse, EndReportResponse, Metrics, CriterionScore, QuoteRef,
    Topic, TopicsResponse, MissedOpportunity
)
from .store import RoomState
from .personas import PERSONA_CATALOG, MODERATOR
from .facts_db import get_facts_for_topic
from .satisfaction import process_student_utterance_and_learnings
from .database import update_student_progress, get_connection

MOCK_TOPICS = [
    Topic(
        id="ai-jobs",
        title="Will AI Create More Jobs Than It Destroys?",
        category="Technology & Economy",
        difficulty="Medium",
        suggested_duration_sec=300,
        context="Debate whether rapid AI automation will cause permanent unemployment or lead to high-value job creation based on WEF and OECD data.",
        format="standard"
    ),
    Topic(
        id="case-startup-crisis",
        title="Case Study: NovaTech Crisis - 30% Layoffs vs. 15% Salary Cuts",
        category="Corporate Strategy & Crisis",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="A Series B startup faces a 40% revenue drop with 8 months runway. Debate employee retention vs burn reduction.",
        format="case_based"
    ),
    Topic(
        id="abstract-silence",
        title="Abstract: Silence is More Eloquent Than Words",
        category="Philosophy & Leadership",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="Interpret the strategic, diplomatic, and interpersonal dimensions of silence versus verbal articulation in leadership.",
        format="abstract"
    ),
    Topic(
        id="controversial-wealth-cap",
        title="Controversial: Should Maximum Personal Wealth Be Capped at $1 Billion?",
        category="Public Policy & Ethics",
        difficulty="Hard",
        suggested_duration_sec=300,
        context="Examine wealth inequality, capital mobility, investment incentives, and progressive taxation.",
        format="controversial"
    ),
    Topic(
        id="remote-work",
        title="Remote Work vs. Return to Office: The Future of Collaboration",
        category="Workplace & Society",
        difficulty="Easy",
        suggested_duration_sec=300,
        context="Examine Stanford/Bloom research on productivity, mentorship deficit, and urban economic shifts.",
        format="standard"
    ),
    Topic(
        id="stock-market-nifty",
        title="Stock Market & Nifty 50: Long-Term Wealth Creation or Pure Speculation?",
        category="Finance & Economy",
        difficulty="Medium",
        suggested_duration_sec=300,
        context="Examine Nifty 50 20-year compounding (~12.5% CAGR), SEBI 93% retail F&O loss study, and risk management.",
        format="standard"
    ),
    Topic(
        id="college-attendance-75",
        title="Mandatory 75% Attendance in Colleges: Discipline or Barrier to Skill Development?",
        category="Education & Campus Life",
        difficulty="Easy",
        suggested_duration_sec=300,
        context="Debate whether strict 75% attendance builds work ethic or deprives engineering students of coding and placement prep time.",
        format="standard"
    )
]

def get_mock_topics() -> TopicsResponse:
    return TopicsResponse(topics=MOCK_TOPICS)

def register_custom_topic(title: str, category: str = "Custom Debate", difficulty: str = "Medium") -> Topic:
    slug = "".join(c if c.isalnum() else "-" for c in title.lower()).strip("-")
    facts = get_facts_for_topic(title)
    new_topic = Topic(
        id=slug,
        title=title,
        category=category,
        difficulty=difficulty,
        suggested_duration_sec=facts.get("suggested_duration_sec", 300),
        context=facts.get("context", f"Custom debate scenario for {title}"),
        format="custom"
    )
    if not any(t.id == slug for t in MOCK_TOPICS):
        MOCK_TOPICS.append(new_topic)
    return new_topic

def generate_contextual_ai_response(
    room: RoomState,
    pid: str,
    student_text: Optional[str],
    is_hinglish: bool,
    is_addressed: bool
) -> str:
    combined_context = f"{room.topic} {student_text or ''}".lower()
    # Calculate how many times this persona has spoken so far to provide fresh, non-repetitive turns
    persona_turn_idx = sum(1 for t in room.transcript if t.speaker_id == pid)

    # Friendly, supportive addressed prefixes (Jarvis / Claude / ChatGPT style)
    addressed_prefixes_en = {
        "kabir": "Really glad you asked that! To give you the honest ground reality: ",
        "aarav": "Great point you brought up! Looking directly at the verified numbers: ",
        "meera": "I really love that angle! Looking at the positive human side: ",
        "ananya": "That connects both sides really well! Here is the balanced middle ground: ",
        "rohan": "Spot-on question! The decisive action to take here is: "
    }
    addressed_prefixes_hi = {
        "kabir": "Bhai bohot valid sawal poocha aapne! Practical angle se dekhein toh: ",
        "aarav": "Aapne bohot solid point uthaya! Data ke hisaab se dekhein toh: ",
        "meera": "Aapka point bohot inspiring laga! Iska positive angle dekhein toh: ",
        "ananya": "Aapne bohot accha point highlight kiya! Iska best middle ground ye hai: ",
        "rohan": "Ekdum sahi sawaal! Action point ye hai ki: "
    }

    # 1. Stock Market, Nifty 50, Finance, Investments
    if any(w in combined_context for w in ["stock", "market", "nifty", "sensex", "trading", "invest", "share", "equity", "finance", "mutual fund", "money"]):
        pools = {
            "kabir": [
                ("SEBI's official study revealed that 93% of retail traders lose capital in short-term F&O trading due to poor risk management. Without discipline, day-trading becomes pure gambling."
                 if not is_hinglish else
                 "Hume ground reality dekhni chahiye: SEBI ki study ke mutabik 93% se zyada retail traders F&O trading me apna capital kho dete hain. Bina risk management ke trading gambling ban jati hai."),
                ("That's why separating long-term compounding from quick intraday hype is crucial. Even legendary investors prove that time in the market beats timing the market every single time."
                 if not is_hinglish else
                 "Asli wealth quick intraday trading se nahi, balki 5 se 10 saal ke patience aur index compounding se banti hai. Har mahine SIP karna speculative trading se 100 times safer hai."),
                ("For college students like us, the smartest move is building a 3-month emergency fund first and starting a small 500-rupee index SIP, instead of falling for fake Telegram tip channels."
                 if not is_hinglish else
                 "College students ke liye practical advice ye hai: fake Telegram tips ke peeche mat bhago. Index mutual fund me chhota monthly SIP shuru karo aur focus apni coding aur career skills par rakho."),
                ("You made a very mature observation there! If you balance equity allocation with a safety cash buffer, market dips won't trigger panic, and you can build sustainable long-term wealth."
                 if not is_hinglish else
                 "Bhai tumhara observation bohot solid hai! Agar equity ke sath thoda safety reserve rakhein, toh market crash me bhi darr nahi lagta aur long-term wealth safely grow hoti hai.")
            ],
            "aarav": [
                ("Looking at Nifty 50 historical data, it has compounded at around 12% to 13% CAGR over the last 20 years, driven by the real earnings growth of India's top 50 corporate leaders."
                 if not is_hinglish else
                 "Nifty 50 ke 20 saal ke historical data ko dekhein toh long term me 12% se 13% CAGR return mila hai, jo companies ki real profit growth par based hai."),
                ("Think about the math of compounding: a disciplined 1,000 rupee monthly SIP in Nifty 50 at 12% CAGR grows to over 10 lakh rupees in 20 years, simple and predictable."
                 if not is_hinglish else
                 "Compounding ka simple math dekhein: har mahine 1,000 rupaye ki index SIP 12% return par 20 saal me 10 lakh se zyada ban jati hai, bina kisi daily stress ke."),
                ("India's corporate tax receipts and GDP are expanding toward 7 trillion dollars by 2030, directly driving the top index companies in banking, IT, and manufacturing."
                 if not is_hinglish else
                 "India ki GDP 2030 tak 7 trillion dollars reach karne wali hai, jiska direct benefit Nifty 50 ke top banking, IT aur manufacturing leaders ko milega."),
                ("Historical rolling data confirms that anyone holding Nifty 50 index funds for over 7 years has virtually zero historical probability of a negative return."
                 if not is_hinglish else
                 "Historical data ye proof karta hai ki agar koi 7 saal se zyada Nifty index me invest rehta hai, toh negative return aane ka risk almost zero ho jata hai.")
            ],
            "meera": [
                ("Rather than stressful day trading, index funds and systematic SIPs give young beginners a peaceful, stress-free way to participate in overall economic growth."
                 if not is_hinglish else
                 "Intraday trading ke daily stress ki jagah, regular index funds aur SIPs ke zariye beginners bilkul safe aur peaceful tarike se wealth create kar sakte hain."),
                ("Financial literacy is such an empowering life skill! When automation handles our savings through SIPs, we can focus our creative energy on coding, design, and our passions."
                 if not is_hinglish else
                 "Financial literacy bohot empowering skill hai! Jab SIP automatic chalti hai, toh hum apna pura focus apne projects aur creative skills par laga sakte hain."),
                ("As young people invest systematically in transparent index companies, our domestic businesses get stronger and innovate faster with Indian capital."
                 if not is_hinglish else
                 "Jab young generation disciplined tarike se invest karti hai, toh hamare desh ke innovative businesses ko grow karne ke liye strong domestic support milta hai."),
                ("Starting early gives us financial freedom and confidence to take bold, creative career choices later in life without fear."
                 if not is_hinglish else
                 "Early age me thoda-thoda invest karne se life me financial peace aur confidence milta hai, taaki hum apne dreams bina darr ke pursue kar sakein.")
            ],
            "ananya": [
                ("Aarav shows the compounding potential and Kabir highlights trading pitfalls. The balanced path is broad index investing paired with a safe emergency fund."
                 if not is_hinglish else
                 "Aarav ka growth point aur Kabir ka risk warning dono valid hain. Smart approach ye hai ki emergency fund ke sath disciplined index investing ki jaye."),
                ("A smart rule of thumb is allocating 80% to safe, broad-market index funds and keeping 20% liquid, completely steering clear of high-risk derivatives."
                 if not is_hinglish else
                 "Best middle ground rule ye hai: 80% safe index funds me aur 20% emergency savings me rakhein, aur risky leverage trading se door rahein."),
                ("Both long-term optimism and short-term caution are essential: know your financial horizon before investing, and never invest money you need in the next 12 months."
                 if not is_hinglish else
                 "Dono sides essential hain: apna time horizon clear rakhein, aur jo paisa agle ek saal me chahiye, usko equity market me invest mat karein."),
                ("This is a wonderful synthesis: financial education in college should teach risk awareness and emotional discipline alongside the power of compounding."
                 if not is_hinglish else
                 "Ye bohot accha consensus hai: colleges me financial literacy sikhani chahiye, jisme compounding ke sath emotional discipline aur risk control bhi sikhaya jaye.")
            ],
            "rohan": [
                ("Inflation at 6% erodes idle bank cash every year. Disciplined investing in top index companies like Nifty 50 is essential to protect purchasing power."
                 if not is_hinglish else
                 "Idle cash par inflation ka loss hota hai. Nifty ke top companies me disciplined investing hi financial security ka reliable tarika hai."),
                ("Starting early at age 20 gives you a massive 10-year compounding head-start compared to someone starting at 30. Proactive action is our biggest advantage."
                 if not is_hinglish else
                 "20 saal ki age me shuru karne se 10 saal ka massive compounding advantage milta hai. Delay karne ki jagah jaldi shuru karna hi sabse bada game-changer hai."),
                ("Execution is everything: instead of waiting for the 'perfect day' to invest, start an automated SIP today and stay consistent month after month."
                 if not is_hinglish else
                 "Analysis paralysis me fasne ki jagah execution par focus karein: ek automated SIP set karein aur consistency maintain karein."),
                ("Disciplined, consistent action beats pure theory. Build the habit of saving and investing early, and financial independence becomes inevitable."
                 if not is_hinglish else
                 "Real world me consistent action hi jeet ta hai. Early age me disciplined habit bana li toh future me financial stress kabhi nahi hoga.")
            ]
        }
    # 2. College Attendance, 75% Rule, Academics
    elif any(w in combined_context for w in ["attendance", "college", "75%", "75 percent", "class", "professor", "mandatory", "student", "degree"]):
        pools = {
            "kabir": [
                ("Mandatory physical presence does not mean genuine learning. If lectures are outdated, forcing students to sit in class only creates frustration."
                 if not is_hinglish else
                 "Sirf biometric attendance lagane se learning nahi hoti. Agar lectures practical nahi hain, toh 75% mandate sirf time waste ban jata hai."),
                ("Ground reality dekho: students sit in the back row doing proxy attendance or scrolling social media. That defeats the whole purpose of education."
                 if not is_hinglish else
                 "Ground reality ye hai ki students back row me baith kar reels scroll karte hain attendance ke liye. Isse koi genuine skill nahi banti."),
                ("Colleges need to recognize that top tech companies look for GitHub repos and solved problems, not whether you had 75% or 90% attendance."
                 if not is_hinglish else
                 "Companies placement me GitHub projects aur problem-solving skills dekhti hain, attendance sheets nahi. Practical talent recognize hona chahiye."),
                ("If a student is genuinely building a startup or contributing to open source, forcing 75% biometric attendance holds them back from succeeding."
                 if not is_hinglish else
                 "Agar student startup build kar raha hai ya open-source coding kar raha hai, toh strict attendance unki growth rok deti hai.")
            ],
            "aarav": [
                ("AICTE data shows that 68% of engineering students learn high-leverage industry skills through self-directed online projects rather than standard lecture hours."
                 if not is_hinglish else
                 "AICTE data dekhein toh 68% students industry-ready skills online projects aur self-study se seekhte hain, rote lectures se nahi."),
                ("Colleges with flexible 60% attendance requirements report higher placement packages because students get dedicated time for DSA and interview prep."
                 if not is_hinglish else
                 "Data batata hai ki flexible attendance wale colleges me placement rate high hota hai kyunki students ko interview prep ka time milta hai."),
                ("Global universities allow students to replace classroom hours with verified corporate internships and laboratory research credits."
                 if not is_hinglish else
                 "Top world universities me students lecture hours ko real internships aur research papers se replace kar sakte hain."),
                ("The data proves that a hybrid model combining core lectures with project credits produces the best employability outcomes."
                 if not is_hinglish else
                 "Hybrid academic model jahan projects ko attendance credit mile, wahi sabse best placement results deta hai.")
            ],
            "meera": [
                ("Colleges should offer credit for verified projects, hackathons, and research rather than counting only physical desk hours."
                 if not is_hinglish else
                 "Attendance ko flexible karke hackathons, real projects aur internships ko academic credits ke form me recognize karna chahiye."),
                ("Education should spark curiosity, not feel like a prison sentence. Flexible schedules allow students to innovate and build real things."
                 if not is_hinglish else
                 "Education me curiosity aur excitement honi chahiye. Flexible schedule se students apne creative ideas par freely kaam kar pate hain."),
                ("When students have time to collaborate on creative multidisciplinary projects, campus culture becomes vibrant and productive."
                 if not is_hinglish else
                 "Jab students ko collaborative projects ka time milta hai, toh campus ka environment bohot innovative aur energetic ban jata hai."),
                ("Let us celebrate practical learning by turning attendance into active participation and creative problem solving!"
                 if not is_hinglish else
                 "Hume learning ko celebrate karna chahiye desk par ghante count karne ki jagah real problem-solving ko value dekar!")
            ],
            "ananya": [
                ("A practical compromise is lowering baseline attendance to 60%, with automatic exemptions for verified internships and technical projects."
                 if not is_hinglish else
                 "Best middle ground ye hai ki 60% minimum attendance rakhein aur verified technical projects aur internships ko attendance credit dein."),
                ("We can balance foundational discipline with student autonomy by recognizing hackathon wins and internships as valid academic attendance."
                 if not is_hinglish else
                 "Dono ko balance karein: basic discipline ke sath verified achievements aur competitions ko attendance waiver milna chahiye."),
                ("Both sides have merit: basic discipline is good for freshmen, but senior students must have flexibility to prepare for placements."
                 if not is_hinglish else
                 "First year me discipline theek hai, par 3rd aur 4th year ke students ko placement prep ke liye freedom milni hi chahiye."),
                ("A phased attendance model solves both concerns smoothly without compromising campus academic standards."
                 if not is_hinglish else
                 "Year-wise flexible attendance system implement karna sabse practical aur balanced solution hai.")
            ],
            "rohan": [
                ("Recruiters evaluate GitHub repositories, live projects, and problem solving, not attendance percentages. Practical skills must take priority."
                 if not is_hinglish else
                 "Companies placement me skills aur practical projects dekhti hain, attendance sheets nahi. Colleges ko skill development par focus karna hoga."),
                ("Speed of skill acquisition is everything. If 75% attendance prevents a student from doing a high-value internship, it directly damages their career."
                 if not is_hinglish else
                 "Agar strict attendance ki wajah se student achhi internship na kar paye, toh ye unke future career ke sath unfair hai."),
                ("Colleges that want high placement percentages must immediately modernize their rules and reward practical execution."
                 if not is_hinglish else
                 "Top engineering colleges wahi hain jo rules flexible karke students ki real-world execution ko boost karte hain."),
                ("The solution is clear: take decisive action to link attendance credits directly to verified coding challenges and internships."
                 if not is_hinglish else
                 "Decisive action lena zaroori hai: coding platforms aur hackathon results ko sidha academic credit se link karo.")
            ]
        }
    # 3. AI, Jobs, Automation
    elif any(w in combined_context for w in ["ai", "job", "automation", "tech", "work", "unemployment", "code", "software"]):
        pools = {
            "kabir": [
                ("That sounds positive, but OECD studies show that 27% of jobs face high risk. Non-technical workers cannot easily switch without years of retraining."
                 if not is_hinglish else
                 "Long term toh theek hai, par OECD report kehti hai 27% jobs high risk par hain. Short term me un displaced workers ka kya hoga?"),
                ("We must be realistic: a displaced administrative or factory worker cannot become an AI engineer in just six months without income support."
                 if not is_hinglish else
                 "Hume ye nahi bhulna chahiye ki ground level par ek displaced worker 6 mahine me AI engineer nahi ban sakta bina financial support ke."),
                ("If big tech companies take all the profits, how will local communities support workers who lose their regular livelihoods?"
                 if not is_hinglish else
                 "Agar saara profit top tech giants me consolidate hoga, toh local workers ko support karne ke liye safety net kahan se aayega?"),
                ("The real hurdle is not whether jobs will exist in 2040, but how we support families during the next 5 to 7 transition years."
                 if not is_hinglish else
                 "Asli challenge 10 saal baad ka nahi hai, balki agle 5 saal ke transition period me ordinary workers ko protect karne ka hai.")
            ],
            "aarav": [
                ("Looking at the data from the World Economic Forum, 85 million routine jobs will change, but 97 million new roles will be created in tech and green energy."
                 if not is_hinglish else
                 "WEF ke data ke mutabik 85 million jobs automate hongi par 97 million nayi roles create hongi, so net growth positive hai."),
                ("Historical economic data from the Industrial Revolution shows farm labor dropped from 70% to under 3%, yet real wages grew 400% as new industries emerged."
                 if not is_hinglish else
                 "Historical data dekhein toh farm labor 70% se ghat kar 3% hua tha, par wages 400% badhi nayi industries aur services ki wajah se."),
                ("Goldman Sachs estimates generative AI will drive a 7% increase in global GDP over a decade, creating massive local service demand."
                 if not is_hinglish else
                 "Goldman Sachs estimate karta hai ki AI se global GDP 7% badhegi, jo local services me nayi jobs generate karegi."),
                ("Empirical studies show engineers using AI tools complete tasks 40% faster with higher code quality, amplifying productivity rather than replacing talent."
                 if not is_hinglish else
                 "Studies confirm karti hain ki AI tools use karne wale developers 40% faster deliver karte hain, jisse unki value badhti hai.")
            ],
            "meera": [
                ("Let us think of AI as a helpful assistant rather than a replacement. It takes away repetitive work so we can focus on creative thinking."
                 if not is_hinglish else
                 "AI ko replacement ki jagah co-pilot samjho. Stanford study kehti hai log routine kaam ki jagah strategy me 40% zyada time spend kar rahe hain."),
                ("Think about brand-new careers like AI prompt engineering, digital ethics auditing, and robotic maintenance that didn't exist three years ago."
                 if not is_hinglish else
                 "Socho prompt designers aur digital ethics reviewers jaise exciting naye careers jo 3 saal pehle exist bhi nahi karte the."),
                ("When routine data work is automated, people can spend more time on healthcare, teaching, storytelling, and empathetic human roles."
                 if not is_hinglish else
                 "Jab repetitive data work automate hota hai, human potential healthcare, teaching aur creative leadership me invest hota hai."),
                ("AI democratizes tools: a solo college student can now build a complete SaaS product with AI that previously required a 20-person company!"
                 if not is_hinglish else
                 "AI se ek akela college student poora startup build kar sakta hai jo pehle 20 logon ki team ke bina possible nahi tha!")
            ],
            "ananya": [
                ("Kabir makes a fair point about transition hurdles, but free reskilling grants paired with apprenticeships can bridge that gap."
                 if not is_hinglish else
                 "Kabir ka point valid hai transition friction par, par agar government reskilling grants de aur companies apprenticeship de, toh ye gap bridge ho sakta hai."),
                ("Looking at both sides, the best solution is giving workers transition security like the Nordic labor model while upskilling them in modern digital tools."
                 if not is_hinglish else
                 "Dono sides ko dekh kar, Nordic model jaise active labor policies aur transition security hi best practical solution hai."),
                ("Aarav shows the long-term growth and Kabir shows the immediate pain. The real answer is managing the transition speed with public-private partnerships."
                 if not is_hinglish else
                 "Aarav ka growth data aur Kabir ka immediate pain dono combine karein toh transition speed manage karna hi core policy solution hai."),
                ("When education systems update curricula to teach human creativity alongside AI literacy, students become indispensable."
                 if not is_hinglish else
                 "Jab colleges human creativity aur AI tools dono sikhayenge, toh graduates replace hone ki jagah highly in-demand banenge.")
            ],
            "rohan": [
                ("In the global economy, nations and companies that hesitate to adopt AI will quickly fall behind international competitors."
                 if not is_hinglish else
                 "Geopolitical reality simple hai: jo desh AI adopt karne me delay karega, woh global market me peeche chhoot jayega."),
                ("Instead of fearing job cuts, colleges must update their syllabus immediately to equip students with practical AI workflows."
                 if not is_hinglish else
                 "Hume execution speed badhani hogi. Proactive curriculum update hi hamara sabse strong career defense hai."),
                ("We cannot afford to delay progress out of fear. Fast execution and practical training are our greatest advantages."
                 if not is_hinglish else
                 "Fear of disruption ki wajah se leadership lose nahi kar sakte. Scale par skilling karna hi national priority hona chahiye."),
                ("Those who master AI tools will lead the next generation of industry. Bold, proactive action is the winning strategy."
                 if not is_hinglish else
                 "Jo log AI tools ko master karenge wahi next generation lead karenge. Bold aur proactive action hi success ka formula hai.")
            ]
        }
    # 4. General / Custom Debate Topic
    else:
        topic_snip = room.topic[:40]
        pools = {
            "kabir": [
                (f"On '{topic_snip}', we cannot ignore the real execution bottlenecks and downside risks before celebrating ideal outcomes."
                 if not is_hinglish else
                 f"'{topic_snip}' me theoretical benefits toh hain, par ground level execution risks ko analyze karna zaroori hai."),
                (f"Looking closely at '{topic_snip}', who bears the real cost when things don't go according to plan? Practical safeguards are essential."
                 if not is_hinglish else
                 f"'{topic_snip}' me jab challenges aate hain toh ground level par kaun suffer karta hai? Safeguards banana sabse pehla step hona chahiye."),
                (f"Before scaling any strategy on '{topic_snip}', let's test small pilot experiments to verify ground reality rather than blind assumptions."
                 if not is_hinglish else
                 f"'{topic_snip}' me blind assumptions ki jagah chhote pilot projects se reality test karna bohot smart approach hogi."),
                (f"That's a very thoughtful view! Acknowledging real constraints on '{topic_snip}' is the only way to build durable solutions."
                 if not is_hinglish else
                 f"Aapne bohot accha point uthaya! Real constraints ko samajh kar hi hum '{topic_snip}' par successful ho sakte hain.")
            ],
            "aarav": [
                (f"When looking at '{topic_snip}', we must evaluate the verified data and measurable trade-offs rather than assumptions."
                 if not is_hinglish else
                 f"'{topic_snip}' par hume real data aur ground metrics ko dekh kar analyze karna chahiye."),
                (f"Measurable metrics on '{topic_snip}' show that structured incentives deliver 3x better outcomes than punitive enforcement."
                 if not is_hinglish else
                 f"Numbers batate hain ki '{topic_snip}' me positive incentives strict penalties se 3 guna zyada effective hote hain."),
                (f"Analyzing historical precedents similar to '{topic_snip}', systemic changes always take measurable phases to show full return on investment."
                 if not is_hinglish else
                 f"Historical data dekhein toh '{topic_snip}' jaise transitions phased implementation ke sath best results dete hain."),
                (f"The numbers support your perspective on '{topic_snip}', proving that balanced allocation yields optimal long-term results."
                 if not is_hinglish else
                 f"Data aapke point ko support karta hai, proving ki '{topic_snip}' me balanced approach hi best metrics deti hai.")
            ],
            "meera": [
                (f"With '{topic_snip}', there is an opportunity to innovate and create human-centric solutions that benefit everyone."
                 if not is_hinglish else
                 f"'{topic_snip}' ko ek positive opportunity ki tarah dekhein toh hum creative solutions develop kar sakte hain."),
                (f"Focusing on empathy and collaboration turns '{topic_snip}' from a rigid argument into an inspiring shared journey."
                 if not is_hinglish else
                 f"Empathy aur cooperation se hum '{topic_snip}' me har stakeholder ke liye win-win scenario create kar sakte hain."),
                (f"Creative thinking allows us to find fresh, untapped solutions for '{topic_snip}' that traditional systems completely overlooked."
                 if not is_hinglish else
                 f"Creative thinking se hum '{topic_snip}' me naye avenues discover kar sakte hain jo pehle kisi ne nahi soche the."),
                (f"I really love that point! When we center people in '{topic_snip}', everyone feels motivated to contribute their best."
                 if not is_hinglish else
                 f"Aapka viewpoint bohot encouraging hai! Jab hum '{topic_snip}' me logon ki khushi ko priority dete hain toh best outcomes aate hain.")
            ],
            "ananya": [
                (f"Looking at '{topic_snip}', the solution lies in finding common ground between practical feasibility and long-term benefit."
                 if not is_hinglish else
                 f"'{topic_snip}' me opposing viewpoints ko merge karke ek realistic consensus banana hi best way forward hai."),
                (f"Balancing immediate needs against long-term goals is the key to mastering '{topic_snip}' without leaving anyone behind."
                 if not is_hinglish else
                 f"Short-term feasibility aur long-term vision ko merge karna hi '{topic_snip}' ka sabse healthy solution hai."),
                (f"Both perspectives on '{topic_snip}' hold essential truths; synthesizing them creates an actionable, bulletproof roadmap."
                 if not is_hinglish else
                 f"Dono sides ke valid points ko combine karke hum '{topic_snip}' par ek solid actionable roadmap taiyyar kar sakte hain."),
                (f"That brings tremendous harmony to the discussion on '{topic_snip}'. Building consensus is what truly drives success."
                 if not is_hinglish else
                 f"Aapne discussion ko bohot acchi direction di hai! Consensus building hi '{topic_snip}' me असली jeet hai.")
            ],
            "rohan": [
                (f"Decisive action on '{topic_snip}' is what matters most; fast execution and proactive steps will determine the outcome."
                 if not is_hinglish else
                 f"'{topic_snip}' me delay karne se issues badhenge, decisive action aur fast execution hi key hai."),
                (f"Instead of endless debates on '{topic_snip}', let's define three concrete action steps and start executing immediately."
                 if not is_hinglish else
                 f"Lambi discussions ki jagah '{topic_snip}' par immediate actionable milestones set karke start karna chahiye."),
                (f"Momentum creates its own clarity on '{topic_snip}'. Organizations that move forward boldly always outperform those that hesitate."
                 if not is_hinglish else
                 f"Speed aur proactive initiative hi '{topic_snip}' me competition se aage nikalne ka best tarika hai."),
                (f"Spot on! Focusing on clear execution and measurable results is exactly how to lead on '{topic_snip}'."
                 if not is_hinglish else
                 f"Ekdum sahi! Practical results aur rapid action hi '{topic_snip}' me real difference create karega.")
            ]
        }

    persona_pool = pools.get(pid, pools.get("aarav", ["Let us evaluate the verified logic."]))
    # Pick turn progressively so the persona never repeats the same line
    selected_text = persona_pool[persona_turn_idx % len(persona_pool)]

    if is_addressed:
        prefix = (addressed_prefixes_hi.get(pid, "Aapke point par directly bolu toh: ")
                  if is_hinglish else
                  addressed_prefixes_en.get(pid, "To answer your question directly: "))
        return prefix + selected_text

    return selected_text

def advance_mock_turn(
    room: RoomState,
    student_text: Optional[str] = None,
    student_started_ms: Optional[int] = None,
    student_ended_ms: Optional[int] = None,
    interrupted_turn_id: Optional[str] = None,
    student_id: Optional[str] = None,
    student_name: Optional[str] = None
) -> NextTurnResponse:
    now_ms = int(time.time() * 1000)
    remaining_sec = room.get_remaining_sec()
    verified_facts = get_facts_for_topic(room.topic)
    is_hinglish = (room.language == "hinglish")

    if interrupted_turn_id:
        room.mark_interrupted(interrupted_turn_id)

    # 1. Opening phase: If transcript is empty, moderator starts
    if len(room.transcript) == 0:
        room.phase = "opening"
        if room.format == "case_based":
            text = (
                f"Hey everyone, welcome! Please relax, this is a friendly practice space to explore ideas together without any pressure. "
                f"Today we're tackling a Case-Study GD: '{room.topic}'. Take a breath and feel free to start whenever you're ready. Who would like to open?"
                if not is_hinglish else
                f"Hey everyone, welcome! Bilkul relax hokar discuss kijiye, ye ek friendly practice room hai jahan hum sab milkar seekhenge. "
                f"Aaj ka case study hai: '{room.topic}'. Kaun shuru karna chahega, ya aap shuru karna chahenge?"
            )
        elif room.format == "abstract":
            text = (
                f"Hello everyone, welcome! There are no wrong answers here, just fresh creative perspectives. "
                f"Our abstract topic today is '{room.topic}'. Take your time to reflect—who would like to share their initial thoughts?"
                if not is_hinglish else
                f"Hello everyone, welcome! Yahan koi right ya wrong answer nahi hai, bas apne unique perspectives openly share kijiye. "
                f"Aaj ka abstract topic hai: '{room.topic}'. Kaun initiate karna chahega?"
            )
        elif room.format == "fishbowl":
            text = (
                f"Welcome everyone! Relax and enjoy the session. We're running a fishbowl on '{room.topic}'. "
                "Inner circle will open the chat, and you can step in whenever you feel ready!"
                if not is_hinglish else
                f"Welcome everyone! Relax karke participate kijiye. Aaj fishbowl round hai on '{room.topic}'. "
                "Jab bhi aap comfortable feel karein, circle me enter karke bol sakte hain!"
            )
        else:
            text = (
                f"Hey everyone, welcome to the discussion room! Don't stress at all, this is a safe, friendly space to practice and learn together. "
                f"Today's topic is '{room.topic}'. Feel free to share your thoughts whenever you're ready—who would like to begin?"
                if not is_hinglish else
                f"Hey everyone, welcome to GD Arena! Stress lene ki bilkul zaroorat nahi hai, ye ek friendly practice room hai jahan hum sab milkar seekhenge. "
                f"Aaj ka topic hai: '{room.topic}'. Kaun start karna chahega, ya aap shuru karna chahenge?"
            )

        mod_turn = room.add_turn(
            speaker_id="moderator",
            speaker_name=MODERATOR["name"],
            role="moderator",
            text=text,
            is_ai=True,
            t_ms=now_ms
        )
        return NextTurnResponse(
            turn=TurnDetail(
                id=mod_turn.id,
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=text,
                t_ms=now_ms,
                voice=MODERATOR["voice"]
            ),
            next_actor="student",
            phase="opening",
            remaining_sec=remaining_sec,
            nudge=None,
            degraded=False
        )

    # 2. Record student text if provided & process satisfaction/learnings
    if student_text and student_text.strip():
        if room.phase == "opening":
            room.phase = "discussion"
        
        spk_id = student_id or "student"
        spk_name = student_name or room.human_participants.get(spk_id, "You")
        room.add_turn(
            speaker_id=spk_id,
            speaker_name=spk_name,
            role="student",
            text=student_text.strip(),
            is_ai=False,
            t_ms=student_ended_ms or now_ms
        )
        learning = process_student_utterance_and_learnings(room.student_id, room.topic, student_text.strip())
        if learning["intent"]["is_satisfied_signal"]:
            room.is_satisfied = True

    # 3. Dynamic closing logic
    if remaining_sec <= 40 and room.phase == "discussion":
        if room.is_satisfied:
            room.phase = "closing"
            text = (
                "As the fundamental questions have been satisfactorily explored, let us begin our concluding remarks."
                if not is_hinglish else
                "Sabhi major points aur doubts cover ho chuke hain, chaliye ab final conclusion summarize karte hain."
            )
            mod_turn = room.add_turn(
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=text,
                is_ai=True,
                t_ms=now_ms
            )
            return NextTurnResponse(
                turn=TurnDetail(
                    id=mod_turn.id,
                    speaker_id="moderator",
                    speaker_name=MODERATOR["name"],
                    role="moderator",
                    text=text,
                    t_ms=now_ms,
                    voice=MODERATOR["voice"]
                ),
                next_actor="student",
                phase="closing",
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )
        else:
            text = (
                "We have reached our baseline time, but you have an open inquiry. Let us provide a concrete factual resolution."
                if not is_hinglish else
                "Baseline time ho gaya hai par student ka query open hai. Let's make sure unko clear answer mile."
            )
            mod_turn = room.add_turn(
                speaker_id="moderator",
                speaker_name=MODERATOR["name"],
                role="moderator",
                text=text,
                is_ai=True,
                t_ms=now_ms
            )
            return NextTurnResponse(
                turn=TurnDetail(
                    id=mod_turn.id,
                    speaker_id="moderator",
                    speaker_name=MODERATOR["name"],
                    role="moderator",
                    text=text,
                    t_ms=now_ms,
                    voice=MODERATOR["voice"]
                ),
                next_actor="ai",
                phase="discussion",
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )

    # 4. If UI calls /next with NO student text
    if not student_text or not student_text.strip():
        if room.consecutive_ai_turns >= 2:
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=None,
                degraded=False
            )

        pause_threshold_ms = room.patience_sec * 6000
        if (now_ms - room.last_student_turn_ms) > pause_threshold_ms:
            fact_ref = verified_facts.get("verified_data_points", [{}])[0].get("claim", "data")
            nudge_msg = (
                f"You haven't spoken recently. How does the verified evidence on '{fact_ref}' shape your view?"
                if not is_hinglish else
                f"Aap thodi der se chup hain. '{fact_ref}' par aapka kya take hai, share kijiye."
            )
            return NextTurnResponse(
                turn=None,
                next_actor="student",
                phase=room.phase,  # type: ignore
                remaining_sec=remaining_sec,
                nudge=nudge_msg,
                degraded=False
            )

    # 5. Pick an AI participant to respond
    # Check if student addressed a specific persona by name
    addressed_id = None
    if student_text:
        st_lower = student_text.lower()
        for p in room.participants:
            if p.name.lower() in st_lower or p.id.lower() in st_lower:
                addressed_id = p.id
                break

    if addressed_id:
        persona_obj = next((p for p in room.participants if p.id == addressed_id), room.participants[0])
    else:
        p_idx = len(room.transcript) % len(room.participants)
        persona_obj = room.participants[p_idx]

    pid = persona_obj.id
    ai_text = generate_contextual_ai_response(
        room=room,
        pid=pid,
        student_text=student_text,
        is_hinglish=is_hinglish,
        is_addressed=(addressed_id is not None)
    )

    ai_turn = room.add_turn(
        speaker_id=pid,
        speaker_name=persona_obj.name,
        role="participant",
        text=ai_text,
        is_ai=True,
        t_ms=now_ms
    )

    next_actor: str = "student" if addressed_id else ("ai" if room.consecutive_ai_turns < 2 else "student")

    return NextTurnResponse(
        turn=TurnDetail(
            id=ai_turn.id,
            speaker_id=pid,
            speaker_name=persona_obj.name,
            role="participant",
            text=ai_text,
            t_ms=now_ms,
            voice=persona_obj.voice
        ),
        next_actor=next_actor,  # type: ignore
        phase=room.phase,       # type: ignore
        remaining_sec=remaining_sec,
        nudge=None,
        degraded=False
    )

def generate_mock_report(room: RoomState) -> EndReportResponse:
    room.phase = "ended"

    word_counts: Dict[str, int] = {}
    for turn in room.transcript:
        spk = turn.speaker_id
        words = len(turn.text.split())
        word_counts[spk] = word_counts.get(spk, 0) + words

    total_words = max(1, sum(word_counts.values()))
    speaking_share_pct: Dict[str, float] = {
        spk: round((cnt / total_words) * 100.0, 1)
        for spk, cnt in word_counts.items()
    }

    metrics = Metrics(
        speaking_share_pct=speaking_share_pct,
        word_counts=word_counts,
        student_interruptions_count=room.student_interruptions_count
    )

    student_turns = [t for t in room.transcript if t.role == "student"]
    first_student_turn = student_turns[0] if student_turns else (
        room.transcript[0] if room.transcript else None
    )
    last_student_turn = student_turns[-1] if student_turns else (
        room.transcript[-1] if room.transcript else None
    )

    default_quote = QuoteRef(
        turn_id=first_student_turn.id if first_student_turn else "turn_1",
        text=first_student_turn.text if first_student_turn else "Initiating discussion."
    )

    criteria = [
        CriterionScore(
            criterion="Starting the discussion",
            score=5 if (student_turns and student_turns[0].id in ["turn_1", "turn_2"]) else 3,
            feedback="Initiated or contributed early with clear conceptual framing grounded in historical parallels.",
            quote=QuoteRef(
                turn_id=first_student_turn.id if first_student_turn else "turn_1",
                text=first_student_turn.text if first_student_turn else "Welcome everyone."
            )
        ),
        CriterionScore(
            criterion="Idea quality",
            score=4,
            feedback="Presented substantive arguments distinguishing between automation categories and real economic impact.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Building on others",
            score=4,
            feedback="Directly referenced prior perspectives and integrated empirical evidence on labor market transitions.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Listening",
            score=4,
            feedback="Demonstrated active listening and allowed other participants to substantiate their positions.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Handling interruptions",
            score=4,
            feedback="Maintained composure and held the floor effectively during lively exchanges.",
            quote=default_quote
        ),
        CriterionScore(
            criterion="Ending strongly",
            score=4,
            feedback="Synthesized the discussion cleanly with actionable policy and educational recommendations.",
            quote=QuoteRef(
                turn_id=last_student_turn.id if last_student_turn else "turn_1",
                text=last_student_turn.text if last_student_turn else "Concluding thoughts."
            )
        )
    ]

    # "What You Could Have Said" replay
    what_you_could_have_said = [
        MissedOpportunity(
            turn_id="turn_3",
            speaker_name="Kabir",
            trigger_text="While long-term trends look positive, what about transitional unemployment?",
            suggested_response="I acknowledge Kabir's point on friction, but according to Nordic active labor studies, transition voucher programs reduce frictional unemployment duration by 45%.",
            missed_angle="Pivoting from obstacle to proactive policy solution with empirical evidence"
        )
    ]

    update_student_progress(
        student_id=room.student_id,
        session_score=82
    )

    try:
        conn = get_connection()
        conn.execute("""
        INSERT OR REPLACE INTO reports (room_id, student_id, topic, overall_score, summary, metrics_json, criteria_scores_json, created_at_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            room.room_id,
            room.student_id,
            room.topic,
            82,
            "Strong, fact-grounded discussion.",
            json.dumps(metrics.model_dump()),
            json.dumps([c.model_dump() for c in criteria]),
            room.created_at_ms
        ))
        conn.commit()
        conn.close()
    except Exception:
        pass

    return EndReportResponse(
        room_id=room.room_id,
        topic=room.topic,
        duration_sec=room.duration_sec,
        total_turns=len(room.transcript),
        overall_score=82,
        summary="Strong, fact-grounded discussion. You demonstrated clear logical reasoning, effectively probed counter-arguments, and synthesized consensus around labor transition solutions.",
        metrics=metrics,
        criteria_scores=criteria,
        what_you_could_have_said=what_you_could_have_said
    )
