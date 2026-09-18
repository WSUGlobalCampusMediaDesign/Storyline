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
    "https://raw.githubusercontent.com/WSUGlobalCampusMediaDesign/Storyline/main/questions.json"
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
			JSON.parse(
				localStorage.getItem(
					"masteredQuestions"
				)
			) || [];

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
    	    JSON.parse(
    	        localStorage.getItem(
    	            "masteredQuestions"
    	        )
    	    ) || [];

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
		// CORRECT
		//

		player.SetVar(
			"DisplayCorrect",
			question.correct
		);

		player.SetVar(
			"DisplayCorrectFB",
			question.correctFB
		);

		//
		// DECOY 1
		//

		player.SetVar(
			"DisplayDecoy1",
			question.decoy1
		);

		player.SetVar(
			"DisplayDecoy1FB",
			question.decoy1FB
		);

		//
		// DECOY 2
		//

		player.SetVar(
			"DisplayDecoy2",
			question.decoy2
		);

		player.SetVar(
			"DisplayDecoy2FB",
			question.decoy2FB
		);

		//
		// DECOY 3
		//

		player.SetVar(
			"DisplayDecoy3",
			question.decoy3
		);

		player.SetVar(
			"DisplayDecoy3FB",
			question.decoy3FB
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

	window.studyApp.randomizeAnswerButtons =
	function () {

		const correctButton =
			object('5n538pbWAvX');

		const decoy1Button =
			object('5YZUKZuatZI');

		const decoy2Button =
			object('5xzqu1EqDY8');

		const decoy3Button =
			object('64zwwSofNNl');

		//
		// AVAILABLE POSITIONS
		//

		const positions = [

			{ x: 30, y: 515 },
			{ x: 30, y: 740 },
			{ x: 30, y: 965 },
			{ x: 30, y: 1190 }

		];

		//
		// FISHER-YATES SHUFFLE
		//

		for (
			let i = positions.length - 1;
			i > 0;
			i--
		) {

			const j =
				Math.floor(
					Math.random() *
					(i + 1)
				);

			[
				positions[i],
				positions[j]
			] = [
				positions[j],
				positions[i]
			];

		}

		//
		// ASSIGN POSITIONS
		//

		const buttons = [

			correctButton,
			decoy1Button,
			decoy2Button,
			decoy3Button

		];

		buttons.forEach(
			(btn, index) => {

				btn.x =
					positions[index].x;

				btn.y =
					positions[index].y;

			}
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
  localStorage.removeItem(
    "masteredQuestions"
);

localStorage.removeItem(
    "currentSessionQuestions"
);

localStorage.removeItem(
    "missedQuestions"
);

localStorage.removeItem(
    "questionIndex"
);

studyApp.updateOverallStats();
studyApp.updateWeekStatus();

console.log(
    "Progress Reset"
);
}

window.Script43 = function()
{
  studyApp.loadCurrentQuestion();
studyApp.randomizeAnswerButtons();
}

window.Script44 = function()
{
  studyApp.recordMissedQuestion()
}

window.Script45 = function()
{
  studyApp.recordMissedQuestion()
}

window.Script46 = function()
{
  studyApp.recordMissedQuestion()
}

window.Script47 = function()
{
  studyApp.questionMastered();
studyApp.nextQuestion();
}

window.Script48 = function()
{
  studyApp.retryMissedQuestions();
}

window.Script49 = function()
{
  studyApp.questionMastered();
}

};
