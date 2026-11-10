(() => {
    const form = document.querySelector("[data-application-form]");
    if (!form) return;

    const scenarioQuestions = {
        Helper: "A new player joins and says they are confused about how to get started. How would you help them?",
        Moderator: "Two players report a disagreement, but you only have part of the story. What would you do next?",
        Builder: "You receive feedback that a build does not fit the server's style. How would you respond and improve it?",
        Admin: "A player reports a suspected hack, but the evidence is unclear. How would you review the report and decide what to do?",
        Developer: "A new plugin or feature causes unexpected problems after release. How would you investigate and resolve the issue?",
        "Event Organizer": "An event has fewer players than expected or a technical problem occurs. How would you adapt?",
        "Media Creator": "How would you make content that is welcoming, accurate, and respectful of other players?",
        Media: "How would you make content that is welcoming, accurate, and respectful of other players?",
        Other: "What role are you proposing, and what is one challenge you might face in it?",
    };
    const steps = [...form.querySelectorAll("[data-application-step]")];
    const indicators = [...document.querySelectorAll("[data-step-indicator]")];
    const submitPanel = form.querySelector("[data-application-submit]");
    const submitButton = submitPanel.querySelector('button[type="submit"]');
    const timeZoneOptions = form.querySelector("#time-zone-options");
    const standardQuestions = form.querySelector("[data-standard-questions]");
    const mediaQuestions = form.querySelector("[data-media-questions]");
    const roleQuestions = [...form.querySelectorAll("[data-role-questions]")];
    const genericScenario = form.querySelector("[data-generic-scenario]");
    const availability = form.querySelector('[name="weekly availability"]');
    const availabilityDetails = form.querySelector("[data-availability-details]");
    const staffHistory = form.querySelector('[name="previous staff experience"]');
    const staffHistoryDetails = form.querySelector("[data-staff-history-details]");
    const scenarioQuestion = form.querySelector("[data-scenario-question]");
    const scenarioHint = form.querySelector("[data-scenario-hint]");
    const serverSelect = form.querySelector('[name="server"]');
    const developerLanguages = [...form.querySelectorAll("[data-developer-language]")];
    const languageHint = form.querySelector("[data-language-hint]");
    const languageOther = form.querySelector("[data-language-other]");
    const builderImages = form.querySelector("[data-builder-images]");
    const builderImagesHint = form.querySelector("[data-builder-images-hint]");
    const mediaPlatforms = [...form.querySelectorAll("[data-media-platform]")];
    const platformEligibility = form.querySelector("[data-platform-eligibility]");
    const platformRequirements = {
        Twitch: { audience: "average audience twitch", channel: "media channel twitch", minimum: 15, metric: "average live viewers" },
        TikTok: { audience: "average audience tiktok", channel: "media channel tiktok", minimum: 15, metric: "average live viewers" },
        YouTube: { audience: "average audience youtube", channel: "media channel youtube", minimum: 30, metric: "average views per video" },
    };
    const status = form.querySelector("[data-application-status]");
    let currentStep = 0;

    if (typeof Intl.supportedValuesOf === "function") {
        const timeZones = ["UTC", ...Intl.supportedValuesOf("timeZone")].sort((a, b) => a.localeCompare(b));
        timeZoneOptions.replaceChildren(...timeZones.map((timeZone) => {
            const option = document.createElement("option");
            option.value = timeZone;
            return option;
        }));
    }

    const setControlsDisabled = (container, disabled) => {
        container.querySelectorAll("input, select, textarea, button").forEach((control) => {
            control.disabled = disabled;
        });
    };

    const updateAvailability = () => {
        const varies = availability.value === "It varies";
        const explanation = availabilityDetails.querySelector("input");
        availabilityDetails.hidden = !varies;
        explanation.disabled = !varies;
    };

    const updateStaffHistory = () => {
        const needsDetails = staffHistory.value === "Yes";
        const details = staffHistoryDetails.querySelector("textarea");
        staffHistoryDetails.hidden = !needsDetails;
        details.disabled = !needsDetails;
    };

    const updateDeveloperLanguages = () => {
        const otherSelected = developerLanguages.some((language) => language.checked && language.value === "Other");
        const otherInput = languageOther.querySelector("input");
        languageOther.hidden = !otherSelected;
        otherInput.disabled = !otherSelected;

        const selectedLanguages = developerLanguages.some((language) => language.checked);
        developerLanguages[0].required = !selectedLanguages;
        developerLanguages[0].setCustomValidity(selectedLanguages ? "" : "Select at least one programming language.");
        languageHint.textContent = selectedLanguages
            ? "Selected languages will be included with your application."
            : "Select at least one language.";
    };

    const updateBuilderImages = () => {
        const files = [...builderImages.files];
        const invalidFile = files.find((file) => {
            const hasImageExtension = /\.(png|jpe?g)$/i.test(file.name);
            return !hasImageExtension || !["image/png", "image/jpeg"].includes(file.type);
        });

        let error = "";
        if (files.length < 2) error = "Select at least 2 build images.";
        else if (files.length > 20) error = "Select no more than 20 build images.";
        else if (invalidFile) error = `${invalidFile.name} is not a PNG or JPG/JPEG image.`;

        builderImages.setCustomValidity(error);
        builderImagesHint.textContent = error || `${files.length} image${files.length === 1 ? "" : "s"} selected. PNG and JPG/JPEG only. Attach these files manually when your email draft opens.`;
    };

    const updateMediaPlatforms = () => {
        const selectedPlatforms = mediaPlatforms.filter((checkbox) => checkbox.checked);
        mediaPlatforms.forEach((checkbox) => {
            const option = checkbox.closest("[data-platform-option]");
            const fields = option.querySelector("[data-platform-fields]");
            const selected = checkbox.checked;
            fields.hidden = !selected;
            fields.querySelectorAll("input").forEach((input) => {
                input.disabled = !selected;
                input.required = selected;
            });
            checkbox.setCustomValidity("");
            checkbox.required = false;
        });

        const qualifiedPlatform = selectedPlatforms.find((checkbox) => {
            const requirement = platformRequirements[checkbox.value];
            const audience = form.elements.namedItem(requirement.audience);
            return audience.value !== "" && Number(audience.value) >= requirement.minimum;
        });

        if (selectedPlatforms.length === 0) {
            mediaPlatforms[0].required = true;
            mediaPlatforms[0].setCustomValidity("Select at least one platform.");
            platformEligibility.textContent = "Select at least one platform and enter its average audience and link.";
        } else {
            const validationPlatform = selectedPlatforms[0];
            validationPlatform.required = true;
            if (!qualifiedPlatform) {
                validationPlatform.setCustomValidity("Meet the minimum average audience on at least one selected platform.");
                platformEligibility.textContent = "To qualify, meet the minimum on at least one selected platform: 15 Twitch/TikTok live viewers or 30 YouTube views per video.";
            } else {
                platformEligibility.textContent = `You meet the minimum on ${qualifiedPlatform.value}. The minimum is required on only one platform.`;
            }
        }
    };

    const updatePosition = () => {
        const selected = form.querySelector('input[name="position"]:checked');
        form.querySelectorAll(".position-option").forEach((option) => {
            const input = option.querySelector('input[name="position"]');
            option.classList.toggle("is-selected", input.checked);
        });

        const role = selected?.value || "";
        const isMedia = role === "Media" || role === "Media Creator";
        const isModerator = role === "Moderator";
        serverSelect.disabled = isModerator;
        if (isModerator) serverSelect.value = "All servers";
        else if (serverSelect.value === "All servers") serverSelect.value = "";
        standardQuestions.hidden = isMedia;
        standardQuestions.disabled = isMedia;
        mediaQuestions.hidden = !isMedia;
        mediaQuestions.disabled = !isMedia;

        if (!isMedia) {
            genericScenario.hidden = isModerator;
            setControlsDisabled(genericScenario, isModerator);
            roleQuestions.forEach((section) => {
                const active = section.dataset.roleQuestions === role;
                section.hidden = !active;
                section.disabled = !active;
            });
            scenarioQuestion.textContent = scenarioQuestions[role] || scenarioQuestions.Other;
            scenarioHint.textContent = role
                ? `Your answer helps us understand how you would approach the ${role} position.`
                : "Select a position above to see a question tailored to that role.";
            updateAvailability();
            updateStaffHistory();
            updateDeveloperLanguages();
            updateBuilderImages();
        } else updateMediaPlatforms();
    };

    const stepIsValid = (step) => [...steps[step].querySelectorAll("[required]")]
        .every((field) => field.checkValidity());
    const focusStep = (step) => {
        const heading = steps[step].querySelector("h2");
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        steps[step].scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const renderStep = () => {
        steps.forEach((step, index) => {
            step.hidden = index !== currentStep;
        });
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle("is-current", index === currentStep);
            indicator.classList.toggle("is-complete", index < currentStep);
            if (index === currentStep) indicator.setAttribute("aria-current", "step");
            else indicator.removeAttribute("aria-current");
        });
        submitPanel.hidden = currentStep !== steps.length - 1;
        const navigation = steps[currentStep].querySelector(".application-step-navigation");
        navigation.querySelector("[data-step-back]").hidden = currentStep === 0;
        const nextButton = navigation.querySelector("[data-step-next]");
        const hint = navigation.querySelector(".application-step-hint");
        nextButton.hidden = currentStep === steps.length - 1;
        nextButton.disabled = !stepIsValid(currentStep);
        submitButton.disabled = !stepIsValid(currentStep);
        hint.textContent = stepIsValid(currentStep) ? "Required fields complete." : "Complete all required fields to continue.";
        status.textContent = "";
    };

    steps.forEach((step) => {
        const navigation = document.createElement("div");
        navigation.className = "application-step-navigation";
        navigation.innerHTML = `
            <button type="button" class="btn-secondary" data-step-back>← Back</button>
            <span class="application-step-hint" aria-live="polite"></span>
            <button type="button" data-step-next>Continue <span aria-hidden="true">→</span></button>`;
        step.append(navigation);
        navigation.querySelector("[data-step-back]").addEventListener("click", () => {
            if (currentStep === 0) return;
            currentStep -= 1;
            renderStep();
            focusStep(currentStep);
        });
        navigation.querySelector("[data-step-next]").addEventListener("click", () => {
            if (!stepIsValid(currentStep)) {
                steps[currentStep].querySelector("[required]:invalid")?.reportValidity();
                return;
            }
            if (currentStep >= steps.length - 1) return;
            currentStep += 1;
            renderStep();
            focusStep(currentStep);
        });
    });

    form.addEventListener("input", (event) => {
        if (event.target.matches("[data-media-platform], [data-platform-fields] input")) updateMediaPlatforms();
        if (event.target.matches("[data-developer-language]")) updateDeveloperLanguages();
        if (event.target.matches("[data-builder-images]")) updateBuilderImages();
        renderStep();
    });
    form.addEventListener("change", (event) => {
        if (event.target.name === "position") updatePosition();
        if (event.target.name === "weekly availability") updateAvailability();
        if (event.target.name === "previous staff experience") updateStaffHistory();
        if (event.target.matches("[data-media-platform]")) updateMediaPlatforms();
        if (event.target.matches("[data-developer-language]")) updateDeveloperLanguages();
        if (event.target.matches("[data-builder-images]")) updateBuilderImages();
        renderStep();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        status.textContent = "";
        if (currentStep < steps.length - 1) {
            if (!stepIsValid(currentStep)) {
                steps[currentStep].querySelector("[required]:invalid")?.reportValidity();
                return;
            }
            currentStep += 1;
            renderStep();
            focusStep(currentStep);
            return;
        }
        for (let index = 0; index < steps.length; index += 1) {
            if (stepIsValid(index)) continue;
            currentStep = index;
            renderStep();
            steps[index].querySelector("[required]:invalid")?.reportValidity();
            focusStep(index);
            return;
        }

        const data = new FormData(form);
        const getAnswer = (name) => data.get(name) || "Not provided";
        const body = [
            "MOKIO SERVER APPLICATION",
            "",
            `Position: ${getAnswer("position")}`,
            `Server: ${serverSelect.value || "Not provided"}`,
            "",
            `Name: ${getAnswer("name")}`,
            `Minecraft username: ${getAnswer("minecraft username")}`,
            `Discord username: ${getAnswer("discord username")}`,
            `Email: ${getAnswer("email")}`,
            `Time zone: ${getAnswer("time zone")}`,
            "",
        ];

        if (getAnswer("position") === "Media" || getAnswer("position") === "Media Creator") {
            const selectedPlatforms = data.getAll("media platform");
            body.push("Media application", `Platforms: ${selectedPlatforms.join(", ")}`);
            selectedPlatforms.forEach((platform) => {
                const requirement = platformRequirements[platform];
                body.push(
                    `${platform} ${requirement.metric}: ${getAnswer(requirement.audience)}`,
                    `${platform} channel/profile: ${getAnswer(requirement.channel)}`,
                );
            });
            body.push(
                "Audience minimum required on at least one platform (15 Twitch/TikTok live viewers or 30 YouTube views per video).",
                `Can commit to 10 hours per week: ${getAnswer("media hours confirmation")}`,
                `Usual streaming schedule: ${getAnswer("media schedule")}`,
                `Content and community approach: ${getAnswer("media content plan")}`,
            );
            body.push("", "Why create content for this server?", getAnswer("media interest"));
        } else {
            body.push(
                "Why this position?",
                getAnswer("why this position"),
                "",
                "Experience and skills",
                getAnswer("experience and skills"),
                "",
                `Previous server staff experience: ${getAnswer("previous staff experience")}`,
            );
            if (getAnswer("previous staff experience") === "Yes") {
                body.push(`Previous server and role: ${getAnswer("previous staff details")}`);
            }
            if (getAnswer("position") === "Moderator") {
                body.push(
                    "",
                    "How would you handle someone spamming in chat because they got scammed when it is not against the rules?",
                    getAnswer("moderator scam spam response"),
                    "",
                    "What would you do if you had access to spectator and /tp and saw a player flying to try to get to their loot after dying?",
                    getAnswer("moderator spectator response"),
                );
            } else {
                body.push("", scenarioQuestion.textContent.trim(), getAnswer("role scenario"));
            }
            body.push(
                "",
                `Weekly availability: ${getAnswer("weekly availability")}`,
            );
            if (getAnswer("weekly availability") === "It varies") {
                body.push(`Availability details: ${getAnswer("availability explanation")}`);
            }
            if (getAnswer("position") === "Developer") {
                const languages = data.getAll("development languages");
                body.push(
                    "",
                    `Programming languages: ${languages.join(", ")}`,
                    "Projects worked on",
                    getAnswer("development projects"),
                    "How they learned to code",
                    getAnswer("development learning"),
                    "Estimated coding speed",
                    getAnswer("development speed"),
                );
                if (languages.includes("Other")) {
                    body.push(`Other language: ${getAnswer("other development language")}`);
                }
            }
            if (getAnswer("position") === "Builder") {
                const imageNames = [...builderImages.files].map((file) => file.name);
                body.push(
                    "",
                    "Kinds of builds made",
                    getAnswer("builder types"),
                    "Typical build size",
                    getAnswer("builder size"),
                    "Building process",
                    getAnswer("builder process"),
                    `Build images selected (${imageNames.length}): ${imageNames.join(", ")}`,
                    "Please attach the selected build images to this email before sending.",
                );
            }
        }

        body.push("", "Anything else you'd like us to know?", getAnswer("additional information"));
        const subject = `Mokio ${getAnswer("position")} Application - ${getAnswer("minecraft username")}`;
        const gmailCompose = new URL("https://mail.google.com/mail/");
        gmailCompose.searchParams.set("view", "cm");
        gmailCompose.searchParams.set("fs", "1");
        gmailCompose.searchParams.set("to", "apply@mokio.online");
        gmailCompose.searchParams.set("su", subject);
        gmailCompose.searchParams.set("body", body.join("\r\n"));
        status.textContent = getAnswer("position") === "Builder"
            ? "Opening a Gmail draft in this tab. Attach your selected build images, review the application, and press Send to submit."
            : "Opening a Gmail draft in this tab. Review it and press Send to submit.";
        window.location.assign(gmailCompose.href);
    });

    updatePosition();
    renderStep();
})();
