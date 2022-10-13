/* global define */
define(function () {
    "use strict";

    return {
        /* Election Labels */
        electionTitleEN: "City of Sault Ste. Marie 2022 Municipal Election",
        unofficialTitleEN: "Unofficial Results",
        electionTitleFR: "Election Title FR",
        unofficialTitleFR: "Unofficial Results FR",

        /* Menu/Lists visibility */
        //area type menu
        isAreaTypeMenuVisible: false,
        //area list could be hidden along with the AreaType Menu, only if the Contest List is visible (and Area Type Menu is not (false))
        isAreaListVisible: true,
        //contest list visibility, if not visible, all contest are automatically displayed
        isContestListVisible: true,
        //if ContestList is visible, All Contest menu item allows display of all contest.
        isAllContestMenuItemVisible: true,
        //display a single contest in the modal dialogue
        isContestDisplayInModalDialogue: false,

        /* Data path */
        //defines URL prefix for data service
        defaultURLprefix: "data/",
        defaultAreaTypeFileName: "areatype",
        defaultAreaListFileName: "arealist",
        defaultAreaResultsFileName: "arearesults",

        /* Animations */
        //area list entering animation
        isAreaListEnterAnimated: false,
        //repeat area list entering animation each time the area is changed
        isAreaListEnterAnimationRepeated: false,
        //enter Area list animation: 1 - bounceLeftIn, 2 - filpX
        enterAreaListAnimation: 0,
        //contest display effect: 0 - no effect, 1 - slideDown, 2 - fadeIn
        contestDisplayEffect: 0,
        //area list item display effect: 0 - no effect, 1 - flash, 2 - bounce
        areaListItemAnimation: 1,

        /* Basic functions */
        //duration of timer in seconds for reloading results, allowed values: 10-120, otherwise default value is 30 seconds
        reloadingPeriod: 30,
        //allow only one sublevel to be opened
        isCollapseSublevel: false,
        //display child area of any parent area
        isChildAreaSubMenuVisible: true,
        //delay before closing the Area Type Menu, in milliseconds
        delayClosingAreaType: 992,
        //show/hide a specific report on the screen
        showAreaStatisticsBlock: true,
        //if area statistics is enabled, define the type of the template: 0 - Top Area, 1 - Top & Local Area, 2 - US
        typeofAreaStatistics: 0,
        //manage visibility of the title elements in the header
        showAreaTitle: true,
        showElectionTitle: true,
        showUnofficialTitle: true,
        showEligibleVotersTitle: false,
        showEligibleVotersGlobalTitle: true,
        //manage visibility of elements in the statistics table
        showTabulators: true,
        showPolls: false,
        showTurnout: true,
        showBallotCast: true,
        showStartedPolls: false,
        //manage cross endorsed votes visibility
        showPartyVotes: false,
        //display choice progress bar that reflects the percentage of taken votes
        showChoiceVotesPercentageBar: true,
        //what column should be used to display the percentage bar: 1 - choiceName, 2 - percentage
        columnToShowPercentageBar: 1,
        //allow sorting choices by votes, true: yes, false: no, sort by natural order
        sortByVotes: true,
        //if there's more than one language then multiple language switch menu is enabled
        languages: ["en"],
        defaultLanguage: "en",

        /* Advanced Controls */

        //Pinned Contest for desktop devices, true: show, false: hide
        showPinnedContest: false,
        //where to place the pinned contest? left or right column?
        isContestPinnedLeft: true,
        //if Pinned Contest is visible, define the Pinned Contest ID
        pinnedContestID: "1001",
        //if Pinned Contest is visible, define the area that holds the Pinned Contest ID
        pinnedAreaID: "49",

        //Loop button presence, true: show, false: hide
        showLoopButton: true,
        //start loop automatically upon the application load?
        isAutoLoopOn: false,
        //contains array of area type IDs that would be in the loop. Leave empty for all area types.
        areaTypeIDLoopArray: ["1"],
        //duration of each loop interval through the Contest list in seconds, allowed values: 5-60
        loopPeriod: 5,

        //Defines the Ballot Cast number presentation in the report: true: if it is poll based turnout tracking, false if it's ballot based
        isPollBasedTurnoutTracking: false,

        /* Old settings NOT IN USE */
        //disabled choice true: show with label disabled, false: show choice, hide label
        showDisabled: false,
        //mark choice with the incumbent status
        showIncumbent: false
    };
});
