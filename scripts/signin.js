/* =========================================================
   Sign-in page — players enter their Minecraft username.
   Saved in this browser only (see Mokio.user in site.js);
   it isn't verified against the game server.
   ========================================================= */
(() => {
    const { url, user } = window.Mokio;
    const USERNAME = /^[A-Za-z0-9_]{3,16}$/; // Minecraft Java usernames
    const page = document.querySelector("[data-signin]");
    if (!page) return;

    const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

    const tplForm = () => `
        <h2>Sign in</h2>
        <p class="lead">Enter your in-game username so the store can deliver your purchases.</p>
        <form novalidate>
            <div class="field">
                <label for="username">Minecraft username</label>
                <input id="username" name="username" autocomplete="username" autocapitalize="off" spellcheck="false"
                       maxlength="16" placeholder="e.g. CoCoMokio" aria-describedby="username-error" required>
                <p class="error" id="username-error" role="alert"></p>
            </div>
            <button class="wide" type="submit">Continue</button>
            <p class="note">3–16 characters: letters, numbers and underscores. No password needed.</p>
        </form>`;

    const tplSignedIn = (name) => `
        <span class="avatar" aria-hidden="true">${esc(name[0].toUpperCase())}</span>
        <h2>Hi, ${esc(name)}!</h2>
        <p class="lead">You're signed in. Your username will be filled in at checkout.</p>
        <a class="btn wide" href="https://store.cocomokio.com/">Go to the store</a>
        <button class="btn-secondary wide" data-signout>Sign out</button>`;

    const draw = () => {
        const name = user.get();
        page.innerHTML = `<div class="panel">${name ? tplSignedIn(name) : tplForm()}</div>`;
        page.querySelector("input")?.focus();
    };

    page.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = page.querySelector("#username");
        const name = input.value.trim();
        const valid = USERNAME.test(name);
        input.setAttribute("aria-invalid", String(!valid));
        page.querySelector("#username-error").textContent = valid ? "" : "Use 3–16 letters, numbers or underscores.";
        if (!valid) return input.focus();
        user.set(name);
        location.reload(); // refresh so the header shows the new name
    });

    page.addEventListener("click", (event) => {
        if (!event.target.closest("[data-signout]")) return;
        user.set("");
        location.reload();
    });

    draw();
})();
