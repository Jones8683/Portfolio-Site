<script setup>
import profilePic from "@/assets/github.png";
</script>

<template>
  <div class="content-wrap">
    <img :src="profilePic" class="profile-pic" alt="Jones Jankovic" />

    <h1 class="name-title">Jones Jankovic</h1>
    <p class="location-text">Student | Australia</p>

    <div class="snake-wrap">
      <img
        src="https://raw.githubusercontent.com/jones8683/jones8683/output/github-contribution-grid-snake-dark.svg"
        alt="GitHub contribution snake"
        class="snake-image"
      />
    </div>

    <section class="about-section">
      <div class="about-title">
        <h2>About</h2>
      </div>
      <div class="about-body">
        <p>
          I’m Jones, a student with a strong interest in technology and
          computing. I enjoy learning how things work and continuously improving
          my skills. I love exploring artificial intelligence and discovering
          and testing the latest advancements in it. I enjoy experimenting with
          new software, and using technology to creatively build, improve, or
          just figure things out.
        </p>
        <p>
          I've done a bit of work on a few projects including
          <a
            href="https://github.com/BetterSEQTA/BetterSEQTA-Plus"
            target="_blank"
            class="repo-link"
            >BetterSEQTA+</a
          >, a web extension for SEQTA that improves and reimagines user
          experience for over 60,000 students across the world.
        </p>
        <p>
          Beyond technology, I’m passionate about music, I love many kinds of
          music and I play the piano. Some of my favorite TV showsare Star Wars
          and Loki. I love reading all kinds of books, especially The High
          Republic serious, and my favorite videogames are Hollow Knight,
          Minecraft, and the Forza Horizon series.
        </p>
      </div>
    </section>

    <section class="about-section">
      <div class="about-title">
        <h2>Contact</h2>
      </div>
      <div class="about-body">
        <p>
          Want to get in touch? Reach out via email or check out my socials:
        </p>
        <ul
          style="
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
          "
        >
          <li>
            Email:
            <a href="mailto:outerrim1977@gmail.com" class="repo-link"
              >jones@jonesjankovic.com</a
            >
          </li>
          <li>
            Discord:
            <a
              href="https://discord.com/users/1378992101970280471"
              target="_blank"
              class="repo-link"
              >Jones8683</a
            >
          </li>
          <li>
            GitHub:
            <a
              href="https://github.com/Jones8683"
              target="_blank"
              class="repo-link"
              >Jones8683</a
            >
          </li>
        </ul>
        <p style="margin-top: 12px">
          Feel free to reach out if you want to talk!
        </p>
      </div>
    </section>

    <section class="about-section">
      <div class="about-title">
        <h2>Contributions & Projects</h2>
      </div>
      <div class="about-body">
        <div class="repo-button-grid">
          <a
            href="https://github.com/BetterSEQTA/BetterSEQTA-Plus"
            target="_blank"
            class="repo-btn"
          >
            <img
              src="https://github.com/BetterSEQTA.png"
              alt=""
              class="repo-logo"
            />
            <div class="repo-info">
              <span class="repo-btn-name">BetterSEQTA+</span>
              <p class="repo-desc">
                Reimagining the SEQTA experience for students worldwide
              </p>
            </div>
          </a>

          <a
            href="https://github.com/BetterSEQTA/DesQTA"
            target="_blank"
            class="repo-btn"
          >
            <img
              src="https://github.com/BetterSEQTA.png"
              alt=""
              class="repo-logo"
            />
            <div class="repo-info">
              <span class="repo-btn-name">DesQTA</span>
              <p class="repo-desc">
                Bringing BetterSEQTA+ functionality to the desktop
              </p>
            </div>
          </a>

          <a
            href="https://github.com/Jones8683/Portfolio-Site"
            target="_blank"
            class="repo-btn"
          >
            <img
              src="https://github.com/Jones8683.png"
              alt=""
              class="repo-logo"
            />
            <div class="repo-info">
              <span class="repo-btn-name">Portfolio Site</span>
              <p class="repo-desc">
                This very site - showcase of my skills and projects
              </p>
            </div>
          </a>

          <a
            href="https://github.com/Jones8683/Arduino-Buzzer-Music"
            target="_blank"
            class="repo-btn"
          >
            <img
              src="https://github.com/Jones8683.png"
              alt=""
              class="repo-logo"
            />
            <div class="repo-info">
              <span class="repo-btn-name">Arduino Buzzer Music</span>
              <p class="repo-desc">
                A collection of tunes for an Arduino buzzer
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
