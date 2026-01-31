import React, { useState, useEffect } from "react";

export default function TypingAnimation() {
  const [text, setText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const sequence = [
      { text: "hey", delay: 100 },
      { text: "he", delay: 150 }, // delete y
      { text: "hey", delay: 100 }, // retype y
      { text: "hey\nwelc", delay: 80 },
      { text: "hey\nwelco", delay: 80 },
      { text: "hey\nwelcom", delay: 80 },
      { text: "hey\nwelcoma", delay: 100 }, // mistake
      { text: "hey\nwelcom", delay: 200 }, // delete a
      { text: "hey\nwelcome", delay: 100 },
      { text: "hey\nwelcome ", delay: 80 },
      { text: "hey\nwelcome t", delay: 80 },
      { text: "hey\nwelcome to", delay: 80 },
      { text: "hey\nwelcome to ", delay: 80 },
      { text: "hey\nwelcome to m", delay: 80 },
      { text: "hey\nwelcome to my", delay: 80 },
      { text: "hey\nwelcome to my ", delay: 80 },
      { text: "hey\nwelcome to my p", delay: 80 },
      { text: "hey\nwelcome to my pe", delay: 80 },
      { text: "hey\nwelcome to my per", delay: 80 },
      { text: "hey\nwelcome to my pers", delay: 80 },
      { text: "hey\nwelcome to my perso", delay: 80 },
      { text: "hey\nwelcome to my person", delay: 80 },
      { text: "hey\nwelcome to my persona", delay: 100 }, // mistake
      { text: "hey\nwelcome to my person", delay: 150 }, // delete a
      { text: "hey\nwelcome to my persona", delay: 100 }, // retype a
      { text: "hey\nwelcome to my personal", delay: 80 },
      { text: "hey\nwelcome to my personal ", delay: 80 },
      { text: "hey\nwelcome to my personal p", delay: 80 },
      { text: "hey\nwelcome to my personal pa", delay: 80 },
      { text: "hey\nwelcome to my personal pag", delay: 80 },
      { text: "hey\nwelcome to my personal page", delay: 80 },
      { text: "hey\nwelcome to my personal page.", delay: 200 },
    ];

    let timeouts = [];
    let currentDelay = 0;

    sequence.forEach((step) => {
      currentDelay += step.delay;
      const timeout = setTimeout(() => {
        setText(step.text);
        if (step === sequence[sequence.length - 1]) {
          setIsComplete(true);
        }
      }, currentDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach((timeout) => clearTimeout(timeout));
  }, []);

  return (
    <h1 className={`typing-animation ${isComplete ? "complete" : ""}`}>
      {text.split("\n").map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))}
      {!isComplete && <span className="cursor">|</span>}
    </h1>
  );
}
