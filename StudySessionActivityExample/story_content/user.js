window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
var getKeyDown = player.getKeyDown;
var keydown = player.keydown;
var keyup = player.keyup;
window.Script1 = function()
{
  console.log("START");

fetch(
    "https://raw.githubusercontent.com/WSUGlobalCampusMediaDesign/Storyline/main/questions_debug.json"
)
.then(response => {

    if (!response.ok) {
        throw new Error(
            `HTTP Error ${response.status}`
        );
    }

    console.log("FETCH SUCCESS");

    return response.json();

})
.then(data => {

    console.log("JSON PARSED");

    //
    // STORE LATEST QUESTION BANK
    //

    localStorage.setItem(
        "allQuestions",
        JSON.stringify(data)
    );

    //
    // CREATE APP NAMESPACE
    //

    window.studyApp = window.studyApp || {};

    //
    // SETUP SCREEN SUMMARY FUNCTION
    //

    window.studyApp.updateSetupSummary =
	function () {

    	const player = GetPlayer();

    	const allQuestions = JSON.parse(
        	localStorage.getItem(
        	    "allQuestions"
        	)
    	);

    	if (!allQuestions) {

        	console.error(
        	    "Question bank not loaded."
        	);

        	return;

    	}

    	const masteredQuestions =
    		studyApp.getValidMasteredQuestions();

    	//
    	// SELECTED WEEKS
    	//

    	const selectedWeeks = [];

    	for (
        	let week = 1;
        	week <= 15;
        	week++
    	) {

        	if (
        	    player.GetVar(
        	        `Week${week}`
        	    )
        	) {

        	    selectedWeeks.push(
        	        week
        	    );

        	}

    	}

    	//
    	// SELECTED DIFFICULTIES
    	//

    	const selectedDifficulties = [];

    	if (
        	player.GetVar(
        	    "DiffEasy"
        	)
    	) {

        	selectedDifficulties.push(
        	    "Easy"
        	);

    	}

    	if (
        	player.GetVar(
        	    "DiffModerate"
        	)
    	) {

        	selectedDifficulties.push(
        	    "Moderate"
        	);

    	}

    	if (
        	player.GetVar(
        	    "DiffDifficult"
        	)
    	) {

        	selectedDifficulties.push(
        	    "Difficult"
        	);

    	}

    	//
    	// FILTER QUESTIONS
    	//

    	const matchingQuestions =
        	allQuestions.filter(
        	    question => {

        	        const weekMatch =
        	            selectedWeeks.includes(
        	                question.week
        	            );

        	        const difficultyMatch =
        	            selectedDifficulties.includes(
        	                question.difficulty
        	            );

        	        return (
        	            weekMatch &&
        	            difficultyMatch &&
        	            question.status ===
        	                "Active"
        	        );

        	    }
        	);

 	    //
    	// COUNTS
    	//

		const masteredQuestionMatches =
			matchingQuestions.filter(
				question =>
					masteredQuestions.includes(
						question.id
					)
			);

		const availableQuestions =
			matchingQuestions.filter(
				question =>
					!masteredQuestions.includes(
						question.id
					)
			);

            //
            // QUESTION TARGET
            //

            const requestedQuestionCount =
                Number(
                    player.GetVar(
                        "RequestedQuestionCount"
                    )
                );

            //
            // START BUTTON
            //

            const startButtonEnabled =
                availableQuestions.length > 0 &&
                requestedQuestionCount > 0;

    	//
    	// UPDATE STORYLINE
    	//

		player.SetVar(
			"SetupMasteredQuestions",
			masteredQuestionMatches.length
		);

    	player.SetVar(
    	    "SetupRemainingQuestions",
    	    availableQuestions.length
    	);

    	player.SetVar(
           "StartButtonEnabled",
           startButtonEnabled
        );

    	//
    	// DEBUG
    	//

    	console.log(
    	    "Selected Weeks:",
    	    selectedWeeks
    	);

    	console.log(
    	    "Selected Difficulties:",
    	    selectedDifficulties
    	);

    	console.log(
    	    "Matching Questions:",
    	    matchingQuestions.length
    	);

		console.log(
			"Mastered Questions:",
			masteredQuestionMatches.length
		);

    	console.log(
    	    "Available Questions:",
    	    availableQuestions.length
    	);

        console.log(
            "RequestedQuestionCount:",
            requestedQuestionCount
        );

        console.log(
            "StartButtonEnabled:",
            startButtonEnabled
        );

	};

	//
	// GET VALID MASTERED QUESTIONS
	//

	window.studyApp.getValidMasteredQuestions =
	function () {

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
			JSON.parse(
				localStorage.getItem(
					"masteredQuestions"
				)
			) || [];

		const currentQuestionIds =
			new Set(
				allQuestions.map(
					question =>
						question.id
				)
			);

		const validMasteredQuestions =
			masteredQuestions.filter(
				id =>
					currentQuestionIds.has(
						id
					)
			);

		return validMasteredQuestions;

	};

	//
	// UPDATE OVERALL STATS
	//

	window.studyApp.updateOverallStats =
	function () {

		const player = GetPlayer();

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
    		studyApp.getValidMasteredQuestions();

		const totalQuestionCount =
			allQuestions.length;

		const masteredCount =
			masteredQuestions.length;

		const remainingCount =
			totalQuestionCount -
			masteredCount;

		const masteryPercent =
			totalQuestionCount === 0
				? 0
				: Math.round(
					(masteredCount /
					totalQuestionCount) * 100
				);

		player.SetVar(
			"OverallTotalQuestionCount",
			totalQuestionCount
		);

		player.SetVar(
			"OverallMasteredCount",
			masteredCount
		);

		player.SetVar(
			"OverallRemainingCount",
			remainingCount
		);

		player.SetVar(
			"OverallMasteryPercent",
			masteryPercent
		);

		    console.log(
			"Questions Loaded:",
			totalQuestionCount
		);

		console.log(
			"Questions Mastered:",
			masteredCount
		);

		console.log(
			"Questions Remaining:",
			remainingCount
		);

		console.log(
			"Mastery Percent:",
			masteryPercent
		);

	};

	//
	// RUN updateOverallStats
	//

	studyApp.updateOverallStats();

	//
	// UPDATE WEEK STATUS
	//
	
	window.studyApp.updateWeekStatus =
	function () {

    	const player = GetPlayer();

    	const allQuestions =
    	    JSON.parse(
    	        localStorage.getItem(
    	            "allQuestions"
    	        )
    	    );

    	if (!allQuestions) {
    	    return;
    	}

    	const masteredQuestions =
    	    studyApp.getValidMasteredQuestions();

    	for (
    	    let week = 1;
    	    week <= 15;
    	    week++
    	) {

    	    const weekQuestions =
    	        allQuestions.filter(
    	            question =>
    	                question.week === week
    	        );

    	    const remainingQuestions =
    	        weekQuestions.filter(
    	            question =>
    	                !masteredQuestions.includes(
    	                    question.id
    	                )
    	        );

    	    //
    	    // Remaining Count
    	    //

    	    player.SetVar(
    	        `DisplayRemainingWeek${week}`,
    	        remainingQuestions.length
    	    );

    	    //
    	    // Week State
    	    //

    	    let weekStatus = 0;
	
    	    if (
    	        weekQuestions.length > 0
    	    ) {

    	        weekStatus = 1;

    	    }

    	    if (
    	        weekQuestions.length > 0 &&
    	        remainingQuestions.length === 0
    	    ) {

    	        weekStatus = 2;

    	    }

    	    player.SetVar(
    	        `WeekAvailable${week}`,
    	        weekStatus
    	    );

    	}

	};
	
	//
	// REMAINING QUESTIONS BY DIFFICULTY
	//

	window.studyApp.updateDifficultyCounts =
	function () {

    	const player = GetPlayer();

    	const allQuestions =
    	    JSON.parse(
    	        localStorage.getItem(
    	            "allQuestions"
    	        )
    	    );

    	if (!allQuestions) {
	
    	    console.error(
    	        "Question bank not loaded."
    	    );
	
    	    return;

    	}

    	const masteredQuestions =
    	    studyApp.getValidMasteredQuestions();

    	//
    	// SELECTED WEEKS
    	//

    	const selectedWeeks = [];

    	for (
    	    let week = 1;
    	    week <= 15;
		    week++
    	) {

    	    if (
    	        player.GetVar(
    	            `Week${week}`
    	        )
    	    ) {

    	        selectedWeeks.push(
    	            week
    	        );

    	    }

    	}

    	//
    	// FILTER TO SELECTED WEEKS
    	//

    	const weekQuestions =
    	    allQuestions.filter(
    	        question =>
    	            selectedWeeks.includes(
    	                question.week
    	            ) &&
    	            !masteredQuestions.includes(
    	                question.id
    	            ) &&
    	            question.status ===
    	                "Active"
    	    );

    	//
    	// COUNT BY DIFFICULTY
    	//

    	const easyCount =
    	    weekQuestions.filter(
    	        question =>
    	            question.difficulty ===
    	            "Easy"
    	    ).length;

    	const moderateCount =
    	    weekQuestions.filter(
    	        question =>
    	            question.difficulty ===
    	            "Moderate"
    	    ).length;

    	const difficultCount =
    	    weekQuestions.filter(
    	        question =>
    	            question.difficulty ===
    	            "Difficult"
    	    ).length;

    	//
    	// UPDATE STORYLINE
    	//

    	player.SetVar(
    	    "DisplayRemainingEasy",
    	    easyCount
    	);

    	player.SetVar(
    	    "DisplayRemainingModerate",
    	    moderateCount
    	);

    	player.SetVar(
    	    "DisplayRemainingDifficult",
    	    difficultCount
    	);

    	//
    	// DEBUG
    	//

    	console.log(
    	    "Easy Remaining:",
    	    easyCount
    	);

    	console.log(
    	    "Moderate Remaining:",
    	    moderateCount
    	);

    	console.log(
    	    "Difficult Remaining:",
    	    difficultCount
    	);

	};

	//
	// RESET SESSION SETUP
	//

	window.studyApp.resetSessionSetup =
	function () {

		const player = GetPlayer();

		//
		// WEEKS
		//

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			player.SetVar(
				`Week${week}`,
				false
			);

		}

		//
		// DIFFICULTIES
		//

		player.SetVar(
			"DiffEasy",
			false
		);

		player.SetVar(
			"DiffModerate",
			false
		);

		player.SetVar(
			"DiffDifficult",
			false
		);

		//
		// SESSION SIZE
		//

		player.SetVar(
			"RequestedQuestionCount",
			0
		);

		//
		// SESSION VARIABLES
		//

		player.SetVar(
			"SessionComplete",
			false
		);

		player.SetVar(
			"HasMissedQuestions",
			false
		);

		player.SetVar(
			"MissedQuestionCount",
			0
		);

		player.SetVar(
			"QuestionMarkedMastered",
			false
		);

		player.SetVar(
			"MadeMistake",
			false
		);

		player.SetVar(
			"StartButtonEnabled",
			false
		);

		console.log(
			"Session Setup Reset"
		);

		//
		// LOCAL STORAGE
		//

		localStorage.removeItem(
			"currentSessionQuestions"
		);

		localStorage.removeItem(
			"questionIndex"
		);

		localStorage.removeItem(
			"missedQuestions"
		);

	};

	//
	// LOAD CURRENT QUESTION
	//

	window.studyApp.loadCurrentQuestion =
	function () {

		const player = GetPlayer();

		const currentSessionQuestions =
			JSON.parse(
				localStorage.getItem(
					"currentSessionQuestions"
				)
			) || [];

		const questionIndex =
			Number(
				localStorage.getItem(
					"questionIndex"
				)
			) || 0;

		if (
			currentSessionQuestions.length === 0
		) {

			console.error(
				"No session questions found."
			);

			return;

		}

		const question =
			currentSessionQuestions[
				questionIndex
			];

		if (!question) {

			console.error(
				"Question index out of range."
			);

			return;

		}

		//
		// QUESTION DATA
		//

		player.SetVar(
			"DisplayQuestionID",
			question.id
		);

		player.SetVar(
			"DisplayWeek",
			question.week
		);

		player.SetVar(
			"DisplayTopic",
			question.topic
		);

		player.SetVar(
			"DisplayDifficulty",
			question.difficulty
		);

		player.SetVar(
			"DisplayQuestion",
			question.question
		);

		player.SetVar(
			"DisplayQuestionCount",
			questionIndex + 1
		);

		//
		// ANSWERS
		//

		const answers = [

			{
				type: "Correct",
				text: question.correct,
				feedback: question.correctFB
			},

			{
				type: "Decoy",
				text: question.decoy1,
				feedback: question.decoy1FB
			},

			{
				type: "Decoy",
				text: question.decoy2,
				feedback: question.decoy2FB
			},

			{
				type: "Decoy",
				text: question.decoy3,
				feedback: question.decoy3FB
			}

		];

		//
		// RANDOMIZE ANSWERS
		//

		for (
			let i = answers.length - 1;
			i > 0;
			i--
		) {

			const j =
				Math.floor(
					Math.random() *
					(i + 1)
				);

			[
				answers[i],
				answers[j]
			] = [
				answers[j],
				answers[i]
			];

		}

		//
		// ASSIGN DISPLAY OPTIONS
		//

		answers.forEach(
			(answer, index) => {

				const option =
					index + 1;

				player.SetVar(
					`DisplayOption${option}`,
					answer.text
				);

				player.SetVar(
					`DisplayOption${option}Type`,
					answer.type
				);

				player.SetVar(
					`DisplayOption${option}FB`,
					answer.feedback
				);

			}
		);

		//
		// SESSION POSITION
		//

		player.SetVar(
			"SessionQuestionNumber",
			questionIndex + 1
		);
		player.SetVar(
			"QuestionMarkedMastered",
			false
		);

		player.SetVar(
			"MadeMistake",
			false
		);

		//
		// DEBUG
		//

		console.log(
			"Loaded Question:",
			question.id
		);

		console.log(
			question
		);

	};

	//
	// RECORD MISSED QUESTION
	//

	window.studyApp.recordMissedQuestion =
	function () {

		const player = GetPlayer();

		player.SetVar(
			"MadeMistake",
			true
		);

		const currentSessionQuestions =
			JSON.parse(
				localStorage.getItem(
					"currentSessionQuestions"
				)
			) || [];

		const questionIndex =
			Number(
				localStorage.getItem(
					"questionIndex"
				)
			) || 0;

		const currentQuestion =
			currentSessionQuestions[
				questionIndex
			];

		if (!currentQuestion) {
			return;
		}

		const missedQuestions =
			JSON.parse(
				localStorage.getItem(
					"missedQuestions"
				)
			) || [];

		const alreadyExists =
			missedQuestions.some(
				question =>
					question.id ===
					currentQuestion.id
			);

		if (!alreadyExists) {

			missedQuestions.push(
				currentQuestion
			);

			localStorage.setItem(
				"missedQuestions",
				JSON.stringify(
					missedQuestions
				)
			);

		}

		console.log(
			"Question Missed:",
			currentQuestion.id
		);

	};

	//
	// SET CURRENT FEEDBACK
	//

	window.studyApp.setCurrentFeedback =
	function (option) {

		const player =
			GetPlayer();

		const feedback =
			player.GetVar(
				`DisplayOption${option}FB`
			);

		console.log(
			"Feedback option:",
			option,
			"Feedback:",
			feedback
		);

		player.SetVar(
			"CurrentFeedback",
			feedback
		);

		console.log(
			"CurrentFeedback:",
			player.GetVar(
				"CurrentFeedback"
			)
		);

	};

	//
	// QUESTION MASTERED
	//

	window.studyApp.questionMastered =
	function () {

		const player = GetPlayer();

		if (
			!player.GetVar(
				"QuestionMarkedMastered"
			)
		) {

			return;

		}

		const currentSessionQuestions =
			JSON.parse(
				localStorage.getItem(
					"currentSessionQuestions"
				)
			) || [];

		const questionIndex =
			Number(
				localStorage.getItem(
					"questionIndex"
				)
			) || 0;

		const currentQuestion =
			currentSessionQuestions[
				questionIndex
			];

		if (!currentQuestion) {

			return;

		}

		const masteredQuestions =
			JSON.parse(
				localStorage.getItem(
					"masteredQuestions"
				)
			) || [];

		if (
			!masteredQuestions.includes(
				currentQuestion.id
			)
		) {

			masteredQuestions.push(
				currentQuestion.id
			);

			localStorage.setItem(
				"masteredQuestions",
				JSON.stringify(
					masteredQuestions
				)
			);

			studyApp.updateOverallStats();

			console.log(
				"Question Mastered:",
				currentQuestion.id
			);

		}

	};

	//
	// NEXT QUESTION
	//

	window.studyApp.nextQuestion =
	function () {

		const player = GetPlayer();

		const currentSessionQuestions =
			JSON.parse(
				localStorage.getItem(
					"currentSessionQuestions"
				)
			) || [];

		let questionIndex =
			Number(
				localStorage.getItem(
					"questionIndex"
				)
			) || 0;

		//
		// ADVANCE
		//

		questionIndex++;

		//
		// SESSION COMPLETE
		//

		if (
			questionIndex >=
			currentSessionQuestions.length
		) {

			studyApp.completeSession();

			player.SetVar(
				"SessionComplete",
				true
			);

			console.log(
				"Session Complete"
			);

			return;

		}

		//
		// SAVE INDEX
		//

		localStorage.setItem(
			"questionIndex",
			questionIndex.toString()
		);

	};

	//
	// COMPLETE SESSION
	//

	window.studyApp.completeSession =
	function () {

		const player = GetPlayer();

		const missedQuestions =
			JSON.parse(
				localStorage.getItem(
					"missedQuestions"
				)
			) || [];

		const missedCount =
			missedQuestions.length;

		player.SetVar(
			"MissedQuestionCount",
			missedCount
		);

		player.SetVar(
			"HasMissedQuestions",
			missedCount > 0
		);

		console.log(
			"Missed Questions:",
			missedCount
		);

	};

	//
	// RETRY MISSED QUESTIONS
	//

	window.studyApp.retryMissedQuestions =
	function () {

		const player = GetPlayer();

		const missedQuestions =
			JSON.parse(
				localStorage.getItem(
					"missedQuestions"
				)
			) || [];

		//
		// SAFETY CHECK
		//

		if (
			missedQuestions.length === 0
		) {

			console.log(
				"No missed questions to retry."
			);

			return;

		}

		//
		// CREATE NEW SESSION
		//

		localStorage.setItem(
			"currentSessionQuestions",
			JSON.stringify(
				missedQuestions
			)
		);

		//
		// RESET MISSED LIST
		//

		localStorage.setItem(
			"missedQuestions",
			JSON.stringify([])
		);

		//
		// RESET INDEX
		//

		localStorage.setItem(
			"questionIndex",
			"0"
		);

		//
		// UPDATE STORYLINE
		//

		player.SetVar(
			"SessionQuestionCount",
			missedQuestions.length
		);

		player.SetVar(
			"SessionQuestionNumber",
			1
		);

		player.SetVar(
			"DisplayQuestionCount",
			1
		);

		player.SetVar(
			"SessionComplete",
			false
		);

		player.SetVar(
			"MissedQuestionCount",
			0
		);

		player.SetVar(
			"HasMissedQuestions",
			false
		);

		console.log(
			"Retry Session Started"
		);

		console.log(
			"Retry Questions:",
			missedQuestions.length
		);

	};

	//
	// UPDATE MASTERED FILTERS
	//

	window.studyApp.updateMasteredFilters =
	function () {

		const player =
			GetPlayer();

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
			studyApp.getValidMasteredQuestions();

		//
		// SELECTED WEEKS
		//

		const selectedWeeks = [];

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			if (
				player.GetVar(
					`FilterMasteredWeek${week}`
				)
			) {

				selectedWeeks.push(
					week
				);

			}

		}

		//
		// SELECTED DIFFICULTIES
		//

		const selectedDifficulties = [];

		if (
			player.GetVar(
				"FilterMasteredDiffEasy"
			)
		) {

			selectedDifficulties.push(
				"Easy"
			);

		}

		if (
			player.GetVar(
				"FilterMasteredDiffModerate"
			)
		) {

			selectedDifficulties.push(
				"Moderate"
			);

		}

		if (
			player.GetVar(
				"FilterMasteredDiffDifficult"
			)
		) {

			selectedDifficulties.push(
				"Difficult"
			);

		}

		//
		// MASTERED QUESTIONS
		//

		const masteredQuestionData =
			allQuestions.filter(
				question =>
					question.status ===
						"Active" &&
					masteredQuestions.includes(
						question.id
					)
			);

		//
		// WEEK COUNTS
		//
		// Week counts respond to
		// selected difficulties.
		//

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			const weekCount =
				masteredQuestionData.filter(
					question => {

						const weekMatch =
							question.week ===
								week;

						const difficultyMatch =
							selectedDifficulties.length ===
								0 ||
							selectedDifficulties.includes(
								question.difficulty
							);

						return (
							weekMatch &&
							difficultyMatch
						);

					}
				).length;

			player.SetVar(
				`DisplayMasteredWeek${week}`,
				weekCount
			);

		}

		//
		// DIFFICULTY COUNTS
		//
		// Difficulty counts respond to
		// selected weeks.
		//

		const difficulties = [
			"Easy",
			"Moderate",
			"Difficult"
		];

		difficulties.forEach(
			difficulty => {

				const difficultyCount =
					masteredQuestionData.filter(
						question => {

							const difficultyMatch =
								question.difficulty ===
									difficulty;

							const weekMatch =
								selectedWeeks.length ===
									0 ||
								selectedWeeks.includes(
									question.week
								);

							return (
								difficultyMatch &&
								weekMatch
							);

						}
					).length;

				player.SetVar(
					`DisplayMasteredDiff${difficulty}`,
					difficultyCount
				);

			}
		);

		//
		// FILTERED MASTERED QUESTIONS
		//

		const filteredQuestions =
			masteredQuestionData.filter(
				question => {

					const weekMatch =
						selectedWeeks.length ===
							0 ||
						selectedWeeks.includes(
							question.week
						);

					const difficultyMatch =
						selectedDifficulties.length ===
							0 ||
						selectedDifficulties.includes(
							question.difficulty
						);

					return (
						weekMatch &&
						difficultyMatch
					);

				}
			);

		//
		// UPDATE STORYLINE
		//

		player.SetVar(
			"DisplayFilteredMasteredCount",
			filteredQuestions.length
		);

		//
		// DEBUG
		//

		console.log(
			"Selected Mastered Weeks:",
			selectedWeeks
		);

		console.log(
			"Selected Mastered Difficulties:",
			selectedDifficulties
		);

		console.log(
			"Total Mastered Questions:",
			masteredQuestionData.length
		);

		console.log(
			"Filtered Mastered Questions:",
			filteredQuestions.length
		);

	};

	//
	// CLEAR WORKING MASTERED FILTERS
	//

	window.studyApp.clearWorkingMasteredFilters =
	function () {

		const player =
			GetPlayer();

		//
		// WEEKS
		//

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			player.SetVar(
				`FilterMasteredWeek${week}`,
				false
			);

		}

		//
		// DIFFICULTIES
		//

		player.SetVar(
			"FilterMasteredDiffEasy",
			false
		);

		player.SetVar(
			"FilterMasteredDiffModerate",
			false
		);

		player.SetVar(
			"FilterMasteredDiffDifficult",
			false
		);

	};

	//
	// APPLY MASTERED FILTERS
	//

	window.studyApp.applyMasteredFilters =
	function () {

		const player =
			GetPlayer();

		//
		// WEEKS
		//

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			player.SetVar(
				`AppliedMasteredWeek${week}`,
				player.GetVar(
					`FilterMasteredWeek${week}`
				)
			);

		}

		//
		// DIFFICULTIES
		//

		player.SetVar(
			"AppliedMasteredDiffEasy",
			player.GetVar(
				"FilterMasteredDiffEasy"
			)
		);

		player.SetVar(
			"AppliedMasteredDiffModerate",
			player.GetVar(
				"FilterMasteredDiffModerate"
			)
		);

		player.SetVar(
			"AppliedMasteredDiffDifficult",
			player.GetVar(
				"FilterMasteredDiffDifficult"
			)
		);

		//
		// APPLIED COUNT
		//

		player.SetVar(
			"DisplayAppliedMasteredCount",
			player.GetVar(
				"DisplayFilteredMasteredCount"
			)
		);

		//
		// RESET TO FIRST PAGE
		//

		player.SetVar(
			"MasteredCurrentPage",
			1
		);

		//
		// LOAD FILTERED QUESTIONS
		//

		studyApp.loadMasteredQuestions();

		console.log(
			"Applied Weeks:",
			Array.from(
				{ length: 15 },
				(_, i) => i + 1
			).filter(
				week =>
					player.GetVar(
						`AppliedMasteredWeek${week}`
					)
			)
		);

		console.log(
			"Applied Difficulties:",
			{
				Easy:
					player.GetVar(
						"AppliedMasteredDiffEasy"
					),
				Moderate:
					player.GetVar(
						"AppliedMasteredDiffModerate"
					),
				Difficult:
					player.GetVar(
						"AppliedMasteredDiffDifficult"
					)
			}
		);

	};

	//
	// RESET MASTERED FILTERS
	//

	window.studyApp.resetMasteredFilters =
	function () {

		const player =
			GetPlayer();

		//
		// WEEKS
		//

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			player.SetVar(
				`FilterMasteredWeek${week}`,
				false
			);

			player.SetVar(
				`AppliedMasteredWeek${week}`,
				false
			);

		}

		//
		// DIFFICULTIES
		//

		player.SetVar(
			"FilterMasteredDiffEasy",
			false
		);

		player.SetVar(
			"FilterMasteredDiffModerate",
			false
		);

		player.SetVar(
			"FilterMasteredDiffDifficult",
			false
		);

		player.SetVar(
			"AppliedMasteredDiffEasy",
			false
		);

		player.SetVar(
			"AppliedMasteredDiffModerate",
			false
		);

		player.SetVar(
			"AppliedMasteredDiffDifficult",
			false
		);

	};

	//
	// INITIALIZE MASTERED MANAGEMENT
	//

	window.studyApp.initializeMasteredManagement =
	function () {

		console.log(
			"INITIALIZE MASTERED MANAGEMENT"
		);

		const player =
			GetPlayer();

		//
		// RESET FILTERS
		//

		studyApp.resetMasteredFilters();

		//
		// UPDATE FILTER DATA
		//

		studyApp.updateWeekStatus();
		studyApp.updateMasteredFilters();

		//
		// NO APPLIED FILTERS = ALL MASTERED
		//

		console.log(
			"Before SetVar:",
			player.GetVar(
				"DisplayAppliedMasteredCount"
			),
			"Filtered:",
			player.GetVar(
				"DisplayFilteredMasteredCount"
			)
		);

		player.SetVar(
			"DisplayAppliedMasteredCount",
			player.GetVar(
				"DisplayFilteredMasteredCount"
			)
		);

		console.log(
			"After SetVar:",
			player.GetVar(
				"DisplayAppliedMasteredCount"
			)
		);

		//
		// DEBUG
		//

		console.log(
			"Initial Applied Mastered Count:",
			player.GetVar(
				"DisplayAppliedMasteredCount"
			)
		);

	};

	//
	// LOAD MASTERED QUESTIONS
	//

	window.studyApp.loadMasteredQuestions =
	function () {

		const player =
			GetPlayer();

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
			studyApp.getValidMasteredQuestions();

		//
		// APPLIED WEEKS
		//

		const appliedWeeks = [];

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			if (
				player.GetVar(
					`AppliedMasteredWeek${week}`
				)
			) {

				appliedWeeks.push(
					week
				);

			}

		}

		//
		// APPLIED DIFFICULTIES
		//

		const appliedDifficulties = [];

		if (
			player.GetVar(
				"AppliedMasteredDiffEasy"
			)
		) {

			appliedDifficulties.push(
				"Easy"
			);

		}

		if (
			player.GetVar(
				"AppliedMasteredDiffModerate"
			)
		) {

			appliedDifficulties.push(
				"Moderate"
			);

		}

		if (
			player.GetVar(
				"AppliedMasteredDiffDifficult"
			)
		) {

			appliedDifficulties.push(
				"Difficult"
			);

		}

		//
		// FILTER MASTERED QUESTIONS
		//
		// No applied selections = All
		//

		const filteredQuestions =
			allQuestions.filter(
				question => {

					const masteredMatch =
						masteredQuestions.includes(
							question.id
						);

					const activeMatch =
						question.status ===
							"Active";

					const weekMatch =
						appliedWeeks.length ===
							0 ||
						appliedWeeks.includes(
							question.week
						);

					const difficultyMatch =
						appliedDifficulties.length ===
							0 ||
						appliedDifficulties.includes(
							question.difficulty
						);

					return (
						masteredMatch &&
						activeMatch &&
						weekMatch &&
						difficultyMatch
					);

				}
			);

		//
		// PAGINATION
		//

		const questionsPerPage =
			4;

		const totalPages =
			Math.max(
				1,
				Math.ceil(
					filteredQuestions.length /
					questionsPerPage
				)
			);

		let currentPage =
			Number(
				player.GetVar(
					"MasteredCurrentPage"
				)
			) || 1;

		//
		// KEEP CURRENT PAGE IN RANGE
		//

		if (
			currentPage > totalPages
		) {

			currentPage =
				totalPages;

		}
		else if (
			currentPage < 1
		) {

			currentPage =
				1;

		}

		player.SetVar(
			"MasteredCurrentPage",
			currentPage
		);

		player.SetVar(
			"MasteredTotalPages",
			totalPages
		);

		//
		// APPLIED RESULT COUNT
		//

		player.SetVar(
			"DisplayAppliedMasteredCount",
			filteredQuestions.length
		);

		//
		// GET CURRENT PAGE
		//

		const startIndex =
			(currentPage - 1) *
			questionsPerPage;

		const pageQuestions =
			filteredQuestions.slice(
				startIndex,
				startIndex +
					questionsPerPage
			);

		//
		// POPULATE QUESTION CARDS
		//

		for (
			let slot = 1;
			slot <= questionsPerPage;
			slot++
		) {

			const question =
				pageQuestions[
					slot - 1
				];

			if (question) {

				//
				// QUESTION
				//

				player.SetVar(
					`DisplayMasteredQuestion${slot}`,
					question.question
				);

				//
				// CORRECT ANSWER
				//

				player.SetVar(
					`DisplayMasteredQuestionAnswer${slot}`,
					question.correct
				);

				//
				// QUESTION ID
				//

				player.SetVar(
					`DisplayMasteredQuestionID${slot}`,
					question.id
				);

				//
				// METADATA SUMMARY
				//

				player.SetVar(
					`DisplayMasteredQuestionSummary${slot}`,
					`Week ${question.week} • ${question.difficulty} • ${question.topic}`
				);

				//
				// SHOW SLOT
				//

				player.SetVar(
					`DisplayMasteredQuestion${slot}Visible`,
					true
				);

			}
			else {

				//
				// CLEAR UNUSED SLOT
				//

				player.SetVar(
					`DisplayMasteredQuestion${slot}`,
					""
				);

				player.SetVar(
					`DisplayMasteredQuestionAnswer${slot}`,
					""
				);

				player.SetVar(
					`DisplayMasteredQuestionID${slot}`,
					""
				);

				player.SetVar(
					`DisplayMasteredQuestionSummary${slot}`,
					""
				);

				//
				// HIDE SLOT
				//

				player.SetVar(
					`DisplayMasteredQuestion${slot}Visible`,
					false
				);

			}

		}

		//
		// DEBUG
		//

		console.log(
			"Applied Mastered Weeks:",
			appliedWeeks
		);

		console.log(
			"Applied Mastered Difficulties:",
			appliedDifficulties
		);

		console.log(
			"Applied Mastered Questions:",
			filteredQuestions.length
		);

		console.log(
			"Mastered Page:",
			currentPage,
			"of",
			totalPages
		);

		console.log(
			"Page Questions:",
			pageQuestions
		);

		//
		// REFRESH ALL CARD STATES
		//

		studyApp.refreshMasteredView();

	};

	//
	// RESET ALL MASTERED QUESTIONS
	//

	window.studyApp.resetAllMasteredQuestions =
	function () {

		//
		// CLEAR CURRENT BANK MASTERED QUESTIONS
		//

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
			JSON.parse(
				localStorage.getItem(
					"masteredQuestions"
				)
			) || [];

		const currentQuestionIds =
			new Set(
				allQuestions.map(
					question =>
						question.id
				)
			);

		const remainingMasteredQuestions =
			masteredQuestions.filter(
				id =>
					!currentQuestionIds.has(
						id
					)
			);

		localStorage.setItem(
			"masteredQuestions",
			JSON.stringify(
				remainingMasteredQuestions
			)
		);

		//
		// CLEAR SESSION DATA
		//

		localStorage.removeItem(
			"currentSessionQuestions"
		);

		localStorage.removeItem(
			"missedQuestions"
		);

		localStorage.removeItem(
			"questionIndex"
		);

		//
		// UPDATE STORYLINE
		//

		studyApp.updateOverallStats();
		studyApp.updateWeekStatus();
		studyApp.updateMasteredFilters();

		//
		// RESET MANAGE DISPLAY
		//

		const player =
			GetPlayer();

		player.SetVar(
			"DisplayAppliedMasteredCount",
			0
		);

		player.SetVar(
			"MasteredCurrentPage",
			1
		);

		studyApp.loadMasteredQuestions();

		console.log(
			"All Mastered Questions Reset"
		);

	};

	//
	// RESET FILTERED MASTERED QUESTIONS
	//

	window.studyApp.resetFilteredMasteredQuestions =
	function () {

		const player =
			GetPlayer();

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
			JSON.parse(
				localStorage.getItem(
					"masteredQuestions"
				)
			) || [];

		//
		// APPLIED WEEKS
		//

		const appliedWeeks = [];

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			if (
				player.GetVar(
					`AppliedMasteredWeek${week}`
				)
			) {

				appliedWeeks.push(
					week
				);

			}

		}

		//
		// APPLIED DIFFICULTIES
		//

		const appliedDifficulties = [];

		if (
			player.GetVar(
				"AppliedMasteredDiffEasy"
			)
		) {

			appliedDifficulties.push(
				"Easy"
			);

		}

		if (
			player.GetVar(
				"AppliedMasteredDiffModerate"
			)
		) {

			appliedDifficulties.push(
				"Moderate"
			);

		}

		if (
			player.GetVar(
				"AppliedMasteredDiffDifficult"
			)
		) {

			appliedDifficulties.push(
				"Difficult"
			);

		}

		//
		// FIND QUESTIONS TO RESET
		//
		// No applied selections = All
		//

		const questionsToReset =
			allQuestions.filter(
				question => {

					const masteredMatch =
						masteredQuestions.includes(
							question.id
						);

					const activeMatch =
						question.status ===
							"Active";

					const weekMatch =
						appliedWeeks.length ===
							0 ||
						appliedWeeks.includes(
							question.week
						);

					const difficultyMatch =
						appliedDifficulties.length ===
							0 ||
						appliedDifficulties.includes(
							question.difficulty
						);

					return (
						masteredMatch &&
						activeMatch &&
						weekMatch &&
						difficultyMatch
					);

				}
			);

		//
		// IDS TO RESET
		//

		const resetIds =
			new Set(
				questionsToReset.map(
					question =>
						question.id
				)
			);

		//
		// KEEP EVERYTHING ELSE
		//

		const remainingMasteredQuestions =
			masteredQuestions.filter(
				id =>
					!resetIds.has(
						id
					)
			);

		//
		// SAVE
		//

		localStorage.setItem(
			"masteredQuestions",
			JSON.stringify(
				remainingMasteredQuestions
			)
		);

		//
		// RESET PAGE
		//

		player.SetVar(
			"MasteredCurrentPage",
			1
		);

		//
		// UPDATE STORYLINE
		//

		studyApp.updateOverallStats();
		studyApp.updateWeekStatus();
		studyApp.updateMasteredFilters();
		studyApp.loadMasteredQuestions();

		console.log(
			"Filtered Mastered Questions Reset:",
			questionsToReset.length
		);

	};

	//
	// RETURN MASTERED QUESTION TO POOL
	//

	window.studyApp.returnMasteredQuestionToPool =
	function (slot) {

		const player =
			GetPlayer();

		const allQuestions =
			JSON.parse(
				localStorage.getItem(
					"allQuestions"
				)
			) || [];

		const masteredQuestions =
			JSON.parse(
				localStorage.getItem(
					"masteredQuestions"
				)
			) || [];

		//
		// QUESTION TO REMOVE
		//

		const questionId =
			player.GetVar(
				`DisplayMasteredQuestionID${slot}`
			);

		if (!questionId) {

			return;

		}

		//
		// CURRENT PAGE
		//

		const currentPage =
			Number(
				player.GetVar(
					"MasteredCurrentPage"
				)
			) || 1;

		//
		// GET APPLIED WEEKS
		//

		const appliedWeeks = [];

		for (
			let week = 1;
			week <= 15;
			week++
		) {

			if (
				player.GetVar(
					`AppliedMasteredWeek${week}`
				)
			) {

				appliedWeeks.push(
					week
				);

			}

		}

		//
		// GET APPLIED DIFFICULTIES
		//

		const appliedDifficulties = [];

		if (
			player.GetVar(
				"AppliedMasteredDiffEasy"
			)
		) {

			appliedDifficulties.push(
				"Easy"
			);

		}

		if (
			player.GetVar(
				"AppliedMasteredDiffModerate"
			)
		) {

			appliedDifficulties.push(
				"Moderate"
			);

		}

		if (
			player.GetVar(
				"AppliedMasteredDiffDifficult"
			)
		) {

			appliedDifficulties.push(
				"Difficult"
			);

		}

		//
		// CURRENT FILTERED LIST
		//
		// Build this BEFORE removing the question
		// so we know which question comes after
		// the current page.
		//

		const filteredQuestions =
			allQuestions.filter(
				question => {

					const masteredMatch =
						masteredQuestions.includes(
							question.id
						);

					const activeMatch =
						question.status ===
							"Active";

					const weekMatch =
						appliedWeeks.length ===
							0 ||
						appliedWeeks.includes(
							question.week
						);

					const difficultyMatch =
						appliedDifficulties.length ===
							0 ||
						appliedDifficulties.includes(
							question.difficulty
						);

					return (
						masteredMatch &&
						activeMatch &&
						weekMatch &&
						difficultyMatch
					);

				}
			);

		//
		// NEXT QUESTION AFTER CURRENT PAGE
		//

		const nextQuestionIndex =
			currentPage * 4;

		const replacementQuestion =
			filteredQuestions[
				nextQuestionIndex
			];

		//
		// REMOVE QUESTION FROM MASTERED LIST
		//

		const updatedMasteredQuestions =
			masteredQuestions.filter(
				id =>
					id !== questionId
			);

		localStorage.setItem(
			"masteredQuestions",
			JSON.stringify(
				updatedMasteredQuestions
			)
		);

		//
		// UPDATE REPLACEMENT SLOT
		//

		if (replacementQuestion) {

			player.SetVar(
				`DisplayMasteredQuestion${slot}`,
				replacementQuestion.question
			);

			player.SetVar(
				`DisplayMasteredQuestionAnswer${slot}`,
				replacementQuestion.correct
			);

			player.SetVar(
				`DisplayMasteredQuestionID${slot}`,
				replacementQuestion.id
			);

			player.SetVar(
				`DisplayMasteredQuestionSummary${slot}`,
				`Week ${replacementQuestion.week} • ${replacementQuestion.difficulty} • ${replacementQuestion.topic}`
			);

			player.SetVar(
				`DisplayMasteredQuestion${slot}Visible`,
				true
			);

		}
		else {

			//
			// NO REPLACEMENT AVAILABLE
			//

			player.SetVar(
				`DisplayMasteredQuestion${slot}`,
				""
			);

			player.SetVar(
				`DisplayMasteredQuestionAnswer${slot}`,
				""
			);

			player.SetVar(
				`DisplayMasteredQuestionID${slot}`,
				""
			);

			player.SetVar(
				`DisplayMasteredQuestionSummary${slot}`,
				""
			);

			player.SetVar(
				`DisplayMasteredQuestion${slot}Visible`,
				false
			);

		}

		//
		// UPDATE COUNTS
		//

		studyApp.updateOverallStats();
		studyApp.updateWeekStatus();
		studyApp.updateMasteredFilters();

		//
		// UPDATE APPLIED COUNT
		//

		const newAppliedCount =
			Math.max(
				0,
				Number(
					player.GetVar(
						"DisplayAppliedMasteredCount"
					)
				) - 1
			);

		player.SetVar(
			"DisplayAppliedMasteredCount",
			newAppliedCount
		);

		//
		// UPDATE TOTAL PAGES
		//

		const newTotalPages =
			Math.max(
				1,
				Math.ceil(
					newAppliedCount / 4
				)
			);

		player.SetVar(
			"MasteredTotalPages",
			newTotalPages
		);

		//
		// MOVE TO LAST VALID PAGE IF NEEDED
		//

		if (
			currentPage > newTotalPages
		) {

			player.SetVar(
				"MasteredCurrentPage",
				newTotalPages
			);

			studyApp.loadMasteredQuestions();

			return;

		}

		//
		// DEBUG
		//

		console.log(
			"Returned Question to Pool:",
			questionId
		);

		console.log(
			"Replacement Question:",
			replacementQuestion
				? replacementQuestion.id
				: "None"
		);

		//
		// REFRESH RETURNED SLOT
		//

		player.SetVar(
			"MasteredReturnedSlot",
			slot
		);

		setTimeout(
			function () {

				const currentValue =
					Number(
						player.GetVar(
							"MasteredReturnRefresh"
						)
					) || 0;

				player.SetVar(
					"MasteredReturnRefresh",
					currentValue + 1
				);

			},
			5
		);

	};

		//
		// NEXT MASTERED PAGE
		//

		window.studyApp.nextMasteredPage =
		function () {

		const player =
			GetPlayer();

		const currentPage =
			Number(
				player.GetVar(
					"MasteredCurrentPage"
				)
			) || 1;

		const totalPages =
			Number(
				player.GetVar(
					"MasteredTotalPages"
				)
			) || 0;

		if (
			currentPage >= totalPages
		) {

			return;

		}

		player.SetVar(
			"MasteredCurrentPage",
			currentPage + 1
		);

		studyApp.loadMasteredQuestions();

	};

	//
	// PREVIOUS MASTERED PAGE
	//

	window.studyApp.previousMasteredPage =
	function () {

		const player =
			GetPlayer();

		const currentPage =
			Number(
				player.GetVar(
					"MasteredCurrentPage"
				)
			) || 1;

		if (
			currentPage <= 1
		) {

			return;

		}

		player.SetVar(
			"MasteredCurrentPage",
			currentPage - 1
		);

		studyApp.loadMasteredQuestions();

	};

	//
	// REFRESH MASTERED VIEW
	//

	window.studyApp.refreshMasteredView =
	function () {

		const player =
			GetPlayer();

		setTimeout(
			function () {

				const currentValue =
					Number(
						player.GetVar(
							"MasteredViewRefresh"
						)
					) || 0;

				player.SetVar(
					"MasteredViewRefresh",
					currentValue + 1
				);

			},
			5
		);

	};

    //
    // INITIALIZATION COMPLETE
    //

    player.SetVar(
        "InitializationComplete",
        true
    );

    //
    // DEBUG
    //

    console.log(
        "SET COMPLETE"
    );

})
.catch(error => {

    console.error(
        "INITIALIZATION FAILED",
        error
    );

});
}

window.Script2 = function()
{
  studyApp.resetSessionSetup()
studyApp.updateWeekStatus();
studyApp.updateOverallStats();
studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
studyApp.resetMasteredFilters();
}

window.Script3 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script4 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script5 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script6 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script7 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script8 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script9 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script10 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script11 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script12 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script13 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script14 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script15 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script16 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script17 = function()
{
  studyApp.updateDifficultyCounts();
studyApp.updateSetupSummary();
}

window.Script18 = function()
{
  studyApp.updateSetupSummary();
}

window.Script19 = function()
{
  studyApp.updateSetupSummary();
}

window.Script20 = function()
{
  studyApp.updateSetupSummary();
}

window.Script21 = function()
{
  studyApp.updateSetupSummary();
}

window.Script22 = function()
{
  studyApp.updateSetupSummary();
}

window.Script23 = function()
{
  studyApp.updateSetupSummary();
}

window.Script24 = function()
{
  studyApp.updateSetupSummary();
}

window.Script25 = function()
{
  studyApp.updateSetupSummary();
}

window.Script26 = function()
{
  studyApp.updateSetupSummary();
}

window.Script27 = function()
{
  studyApp.updateSetupSummary();
}

window.Script28 = function()
{
  studyApp.updateSetupSummary();
}

window.Script29 = function()
{
  studyApp.updateSetupSummary();
}

window.Script30 = function()
{
  studyApp.updateSetupSummary();
}

window.Script31 = function()
{
  studyApp.updateSetupSummary();
}

window.Script32 = function()
{
  studyApp.updateSetupSummary();
}

window.Script33 = function()
{
  studyApp.updateSetupSummary();
}

window.Script34 = function()
{
  studyApp.updateSetupSummary();
}

window.Script35 = function()
{
  studyApp.updateSetupSummary();
}

window.Script36 = function()
{
  studyApp.updateSetupSummary();
}

window.Script37 = function()
{
  studyApp.updateSetupSummary();
}

window.Script38 = function()
{
  studyApp.updateSetupSummary();
}

window.Script39 = function()
{
  studyApp.updateSetupSummary();
}

window.Script40 = function()
{
  studyApp.updateSetupSummary();
}

window.Script41 = function()
{
  const player = GetPlayer();

const allQuestions =
    JSON.parse(
        localStorage.getItem(
            "allQuestions"
        )
    ) || [];

const masteredQuestions =
    JSON.parse(
        localStorage.getItem(
            "masteredQuestions"
        )
    ) || [];

//
// SELECTED WEEKS
//

const selectedWeeks = [];

for (
    let week = 1;
    week <= 15;
    week++
) {

    if (
        player.GetVar(
            `Week${week}`
        )
    ) {

        selectedWeeks.push(
            week
        );

    }

}

//
// SELECTED DIFFICULTIES
//

const selectedDifficulties = [];

if (
    player.GetVar(
        "DiffEasy"
    )
) {

    selectedDifficulties.push(
        "Easy"
    );

}

if (
    player.GetVar(
        "DiffModerate"
    )
) {

    selectedDifficulties.push(
        "Moderate"
    );

}

if (
    player.GetVar(
        "DiffDifficult"
    )
) {

    selectedDifficulties.push(
        "Difficult"
    );

}

//
// FILTER QUESTIONS
//

let availableQuestions =
    allQuestions.filter(
        question => {

            return (
                selectedWeeks.includes(
                    question.week
                ) &&
                selectedDifficulties.includes(
                    question.difficulty
                ) &&
                !masteredQuestions.includes(
                    question.id
                ) &&
                question.status ===
                    "Active"
            );

        }
    );

//
// SHUFFLE
//

for (
    let i =
        availableQuestions.length - 1;
    i > 0;
    i--
) {

    const j =
        Math.floor(
            Math.random() *
            (i + 1)
        );

    [
        availableQuestions[i],
        availableQuestions[j]
    ] = [
        availableQuestions[j],
        availableQuestions[i]
    ];

}

//
// SESSION SIZE
//

const requestedQuestionCount =
    Number(
        player.GetVar(
            "RequestedQuestionCount"
        )
    );

const sessionQuestions =
    availableQuestions.slice(
        0,
        Math.min(
            requestedQuestionCount,
            availableQuestions.length
        )
    );

//
// STORE SESSION
//

localStorage.setItem(
    "currentSessionQuestions",
    JSON.stringify(
        sessionQuestions
    )
);

localStorage.setItem(
    "missedQuestions",
    JSON.stringify([])
);

localStorage.setItem(
    "questionIndex",
    "0"
);

//
// STORYLINE
//

player.SetVar(
    "SessionQuestionCount",
    sessionQuestions.length
);

player.SetVar(
    "SessionQuestionNumber",
    1
);

//
// DEBUG
//

console.log(
    "Session Created"
);

console.log(
    sessionQuestions
);

console.log(
    "Session Size:",
    sessionQuestions.length
);
}

window.Script42 = function()
{
  studyApp.resetMasteredFilters();
}

window.Script43 = function()
{
  studyApp.initializeMasteredManagement();
studyApp.loadMasteredQuestions();
}

window.Script44 = function()
{
  studyApp.nextMasteredPage();

}

window.Script45 = function()
{
  studyApp.previousMasteredPage();

}

window.Script46 = function()
{
  studyApp.returnMasteredQuestionToPool(1);
}

window.Script47 = function()
{
  studyApp.returnMasteredQuestionToPool(2);
}

window.Script48 = function()
{
  studyApp.returnMasteredQuestionToPool(3);
}

window.Script49 = function()
{
  studyApp.returnMasteredQuestionToPool(4);
}

window.Script50 = function()
{
  studyApp.loadMasteredFilters();
}

window.Script51 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script52 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script53 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script54 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script55 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script56 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script57 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script58 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script59 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script60 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script61 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script62 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script63 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script64 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script65 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script66 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script67 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script68 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script69 = function()
{
  studyApp.applyMasteredFilters();
}

window.Script70 = function()
{
  window.studyApp.updateMasteredFilters();
}

window.Script71 = function()
{
  studyApp.clearWorkingMasteredFilters();
}

window.Script72 = function()
{
  studyApp.resetFilteredMasteredQuestions();
}

window.Script73 = function()
{
  studyApp.resetAllMasteredQuestions();
}

window.Script74 = function()
{
  studyApp.loadCurrentQuestion();
}

window.Script75 = function()
{
  studyApp.setCurrentFeedback(1);
}

window.Script76 = function()
{
  studyApp.recordMissedQuestion();
}

window.Script77 = function()
{
  studyApp.setCurrentFeedback(2);
}

window.Script78 = function()
{
  studyApp.recordMissedQuestion();
}

window.Script79 = function()
{
  studyApp.setCurrentFeedback(3);
}

window.Script80 = function()
{
  studyApp.recordMissedQuestion();
}

window.Script81 = function()
{
  studyApp.setCurrentFeedback(4);
}

window.Script82 = function()
{
  studyApp.recordMissedQuestion();
}

window.Script83 = function()
{
  studyApp.questionMastered();
studyApp.nextQuestion();
}

window.Script84 = function()
{
  studyApp.retryMissedQuestions();
}

window.Script85 = function()
{
  studyApp.questionMastered();
}

};
