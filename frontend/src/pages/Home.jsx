import React from "react";
import { Link } from "react-router-dom";
import TypingAnimation from "../components/TypingAnimation";

export default function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <TypingAnimation />

        <div className="hero-description">
          <p>here you can:</p>
          <ul>
            <li>
              *try out my publicly open{" "}
              <Link to="/projects" className="link-highlight">
                projects
              </Link>
            </li>
            <li>
              *leave{" "}
              <Link to="/notes" className="link-highlight">
                notes
              </Link>
            </li>
            <li>
              *read my{" "}
              <Link to="/posts" className="link-highlight">
                posts
              </Link>
            </li>
            <li>
              *even see what i am listening to on{" "}
              <a
                href="https://open.spotify.com/user/313tv3lpxnwpjfrmclgff7swdzua"
                target="_blank"
                rel="noreferrer"
                className="link-highlight"
              >
                spotify
              </a>{" "}
              at the moment.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
