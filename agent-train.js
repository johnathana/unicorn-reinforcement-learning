$.when(
    $.getScript("https://cs.stanford.edu/people/karpathy/convnetjs/build/convnet.js"),
    $.getScript("https://cs.stanford.edu/people/karpathy/convnetjs/build/util.js"),
    $.getScript("https://cs.stanford.edu/people/karpathy/convnetjs/build/vis.js"),
    $.getScript("https://cs.stanford.edu/people/karpathy/convnetjs/build/deepqlearn.js"),
    $.Deferred(function (deferred) {
        $(deferred.resolve);
    })
).done(function () {

    $('body').append('<div id="brain_info_div" style="position:absolute;top:150px;width:300px;height:200px;opacity:0.3;z-index:100;background:#000;"></div>');

    var num_inputs = 9;
    var num_actions = 2;
    var temporal_window = 0;
    var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

    // the value function network computes a value of taking any of the possible actions
    // given an input state. Here we specify one explicitly the hard way
    // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
    // to just insert simple relu hidden layers.
    var layer_defs = [];
    layer_defs.push({type: 'input', out_sx: 1, out_sy: 1, out_depth: network_size});
    layer_defs.push({type: 'fc', num_neurons: 20, activation: 'relu'});
    layer_defs.push({type: 'fc', num_neurons: 20, activation: 'relu'});
    layer_defs.push({type: 'regression', num_neurons: num_actions});

    // options for the Temporal Difference learner that trains the above net
    // by backpropping the temporal difference learning rule.
    var tdtrainer_options = {
        learning_rate: 0.001,
        momentum: 0.0,
        batch_size: 128,
        l2_decay: 0.01
    };

    var opt = {};
    opt.temporal_window = temporal_window;
    opt.experience_size = 100000;
    opt.start_learn_threshold = 50000;
    opt.gamma = 0.95;
    opt.learning_steps_total = 500000;
    opt.learning_steps_burnin = 1000;
    opt.epsilon_min = 0.0;
    opt.epsilon_test_time = 0.0;
    opt.layer_defs = layer_defs;
    opt.tdtrainer_options = tdtrainer_options;

    var brain = new deepqlearn.Brain(num_inputs, num_actions, opt);

    startGame();


    function brainAction() {
        return brain.forward([
            state.card.choices.a.values.valuation,
            state.card.choices.a.values.happiness,
            state.card.choices.a.values.time,
            state.card.choices.b.values.valuation,
            state.card.choices.b.values.happiness,
            state.card.choices.b.values.time,
            state.happiness / 10.0,
            state.valuation / 100.0,
            state.time
        ]);
    }

    var trainingId = setInterval(function () {

        // play action
        var win = (brainAction() === 0) ? api.pickA() : api.pickB();
        nextTurn(win)

        var reward = 0;

        if (state.win != null) {
            reward = (state.win) ? 1 : -1;

            resetGame();
            startGame();
        }

        brain.backward(reward);

    }, 0);

    var brain_info = document.getElementById('brain_info_div');
    var supervisingId = setInterval(function () {
        brain.visSelf(brain_info);
        if (brain.age >= opt.learning_steps_total) {
            clearInterval(trainingId);
            clearInterval(supervisingId);

            evaluateModel();
            copy(brain.value_net.toJSON());
        }
    }, 1000);


    function evaluateModel() {
        // don't make any more random choices
        brain.learning = false;

        var games = 1000;
        resetGame();
        startGame();

        var evaluationStats = {
            wins: 0,
            happiness: 0,
            valuation: 0,
            time: 0
        };

        while (1) {
            // play action
            var win = brainAction() === 0 ? api.pickA() : api.pickB();
            nextTurn(win)

            if (state.win != null) {
                if (state.win) {
                    evaluationStats['wins']++;
                    console.log("Win with valuation: " + state.valuation);
                } else {
                    evaluationStats[state.defeatReason]++;
                }

                resetGame();
                startGame();

                if (--games <= 0) {
                    console.log(evaluationStats);
                    break;
                }
            }
        }

        brain.learning = true;
    }

});
