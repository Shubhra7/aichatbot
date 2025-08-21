import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// export async function POST(request) {
//     try {
//         const {message} = await request.json()

//         const completion = await openai.responses.create({
//             model: "gpt-4.1-mini",
//             input: message
//             // messages: [{role: 'user', content: message}]
//         })
//         console.log("hello");
        
//         return Response.json({
//             response: completion.choices[0].message.content
//         })

//     } catch (error) {
//         console.log("hehe");
//         console.log(error);
        
//         return Response.json({
//             error: "Failed to process request"+error.message
//         },{
//             status: 500
//         })
//     }
// }

export async function POST(request) {
  try {
    const { message } = await request.json();

    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // set in .env.local
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // model: "openai/gpt-oss-20b:free", 
        model: "z-ai/glm-4.5-air:free", 
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await completion.json();
    // console.log(data);
    

    return Response.json({
      response: data.choices[0].message.content,
    });

  } catch (error) {
    console.error("Error in /api/chat:", error);

    return Response.json(
      { error: "Failed to process request: " + error.message },
      { status: 500 }
    );
  }
}
