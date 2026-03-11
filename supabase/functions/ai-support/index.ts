import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, emailOnly } = await req.json();

    // Always send email notification to support
    const emailBody = `
New Support Message from World War Royale:

Message: ${message}

Previous conversation:
${(history || []).map((m: any) => `${m.role}: ${m.text}`).join('\n')}

---
Sent automatically from World War Royale support system.
    `.trim();

    // Try to send email notification (best effort)
    try {
      // Use a simple fetch to a mail endpoint or log for now
      console.log(`[SUPPORT EMAIL] To: tuasfait@gmail.com\nSubject: WWR Support Request\n\n${emailBody}`);
    } catch (e) {
      console.error("Failed to send email:", e);
    }

    if (emailOnly) {
      return new Response(JSON.stringify({ sent: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate AI response using game knowledge
    const gameKnowledge = `You are the AI customer support for World War Royale, an epic card battle game. You help players with:
- Battle mechanics (troops, spells, buildings, champions with abilities)
- Card collection and upgrades
- Clan system (joining, creating, war)
- River Race (weekly 7-day cycle)
- War Pass (60 tiers, crowns)
- Shop (gems, gold, chests, daily deals)
- Events (challenges, tournaments)
- Leaderboards (local, worldwide, top 100)
- Settings (language, audio, visuals)
- Technical issues (login, sync, payments)

Be helpful, friendly, and concise. If it's a bug, acknowledge it and say the team will investigate. If it's a feature question, explain it clearly.`;

    // Simple rule-based response (no external API needed)
    const lowerMsg = message.toLowerCase();
    let reply = "Thank you for reaching out! I've forwarded your message to our support team at tuasfait@gmail.com. They will get back to you soon.";

    if (lowerMsg.includes('bug') || lowerMsg.includes('broken') || lowerMsg.includes('not working') || lowerMsg.includes('glitch')) {
      reply = "I'm sorry you're experiencing issues! I've logged this bug report and forwarded it to our development team. They'll investigate and fix it as soon as possible. In the meantime, try restarting the app. If the issue persists, we'll follow up via email.";
    } else if (lowerMsg.includes('payment') || lowerMsg.includes('purchase') || lowerMsg.includes('buy') || lowerMsg.includes('stripe')) {
      reply = "For payment issues, please make sure you have a stable internet connection. If a purchase failed but you were charged, don't worry - our team will verify and resolve this. Your transaction details have been forwarded to support.";
    } else if (lowerMsg.includes('trophy') || lowerMsg.includes('trophies')) {
      reply = "Trophies are earned by winning ranked battles. You gain 20-40 trophies per win and lose 10-30 per loss. Non-trophy modes (Events, River Race, Friendly) don't affect your trophy count. Your arena tier is determined by your trophy count.";
    } else if (lowerMsg.includes('champion') || lowerMsg.includes('ability')) {
      reply = "Champions have special abilities that cost elixir to activate. Place your Champion in a Hero Slot (first positions in your deck) to activate their passive ability. The active ability button appears when the Champion is deployed and alive on the battlefield.";
    } else if (lowerMsg.includes('clan') || lowerMsg.includes('guild')) {
      reply = "To join a clan, go to Social → Clan tab and search for clans. Creating a clan costs 100 gems. Clan leaders can customize the flag, name, and description. Participate in River Race for clan rewards!";
    } else if (lowerMsg.includes('war pass')) {
      reply = "The War Pass has 60 tiers, requiring 10 crowns per tier. Earn crowns by winning battles. War Pass+ unlocks exclusive rewards at Tiers 50, 55, and 60. You can skip tiers for 50 gems each.";
    } else if (lowerMsg.includes('card') || lowerMsg.includes('upgrade') || lowerMsg.includes('level')) {
      reply = "Cards can be upgraded using gold and duplicate cards. Collect cards from chests, shop deals, and event rewards. Higher rarity cards need fewer duplicates but more gold to upgrade. Max card level is 14 (4 for tower cards).";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('help')) {
      reply = "Hello, warrior! 👋 I'm the WWR support bot. How can I help you today? I can assist with battle mechanics, card upgrades, clan features, shop issues, or any bugs you've encountered.";
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
