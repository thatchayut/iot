    $(function() {

    var container = $("#live-chart");

    var mqtt_icon = $("#mqtt-icon");
    var mqtt_status = $("#mqtt-status");
    var mqtt_panel = $("#mqtt-panel");

    var esp1_icon = $("#esp1-icon");
    var esp1_status = $("#esp1-status");
    var esp1_panel = $("#esp1-panel");

    var esp2_icon = $("#esp2-icon");
    var esp2_status = $("#esp2-status");
    var esp2_panel = $("#esp2-panel");

    var esp1_led_icon = $("#esp1-led-icon");
    var esp1_led_status = $("#esp1-led-status");
    var esp1_led_panel = $("#esp1-led-panel");
    var esp1_led_button = $("#esp1-led-button");

    var esp2_led_icon = $("#esp2-led-icon");
    var esp2_led_status = $("#esp2-led-status");
    var esp2_led_panel = $("#esp2-led-panel");
    var esp2_led_button = $("#esp2-led-button");

    esp1_led_panel.hide();
    esp2_led_panel.hide();

    // Determine how many data points to keep based on the placeholder's initial size;
    // this gives us a nice high-res plot while avoiding more than one point per pixel.
    var totalPoints = container.outerWidth() / 20 || 100;
    console.log("Chart: max points = "+totalPoints);

    var esp1_sensor_data = [];
    var esp2_sensor_data = [];

    var esp1_led = false;
    var esp2_led = false;
    var esp1_offline = 0;
    var esp2_offline = 0;

    var dataset = {
        get: function() {
            var data = [];
            if(esp1_sensor_data.length>0)
                data.push({ label: "Random ESP1", data: esp1_sensor_data, color: "#00FFee" });
            if(esp2_sensor_data.length>0)
                data.push({ label: "LDR ESP2", data: esp2_sensor_data, color: "#00FF00" });
            return data;
        }
    };

    // Update Graph
    var update = function () {
        $.plot(container, dataset.get(), {
            grid: {
                borderWidth: 1,
                minBorderMargin: 20,
                labelMargin: 10,
                backgroundColor: {
                    colors: ["#fff", "#e4f4f4"]
                },
                margin: {
                    top: 8,
                    bottom: 20,
                    left: 20
                },
                markings: function(axes) {
                    var markings = [];
                    var xaxis = axes.xaxis;
                    for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
                        markings.push({
                            xaxis: {
                                from: x,
                                to: x + xaxis.tickSize
                            },
                            color: "rgba(232, 232, 255, 0.2)"
                        });
                    }
                    return markings;
                }
            },
            legend: {        
                labelBoxBorderColor: "#fff"
            },
            series: {
                points: {
                    show: true
                },
                lines: {
                    show: true,
                    lineWidth: 1.2,
                    fill: true
                },
                grid: {
                    hoverable: true
                }
            },
            yaxis: {
                min: 0,
                max: 1024
            },
            xaxis: {
                mode: "time",
                tickSize: [2, "second"],
                tickFormatter: function (v, axis) {
                    var date = new Date(v);
             
                    if (date.getSeconds() % 5 == 0) {
                        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
             
                        return hours + ":" + minutes + ":" + seconds;
                    } else {
                        return " ";
                    }
                },
                axisLabel: "Time",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 10
            },
        });
    }

    // Boker info
    var hostname = "broker.mqttdashboard.com";
    var port = 8000;
    var clientid = "cpe24-demo-"+parseInt(Math.random() * 100000, 16);

    var ESP1_PING_TOPIC = "cpe24mqttdemo/esp1/ping";
    var ESP2_PING_TOPIC = "cpe24mqttdemo/esp2/ping";

    var ESP1_LED_TOPIC = "cpe24mqttdemo/esp1/led";
    var ESP1_SENSOR_TOPIC = "cpe24mqttdemo/esp1/sensor";

    var ESP2_LED_TOPIC = "cpe24mqttdemo/esp2/led";
    var ESP2_SENSOR_TOPIC = "cpe24mqttdemo/esp2/sensor";

    var client = new Messaging.Client(hostname, port, clientid);
 
    var options = {

        //connection attempt timeout in seconds
        timeout: 3,

        //Gets Called if the connection has successfully been established
        onSuccess: function () {
            console.log("Connected");
            mqtt_status.text("Connected");
            mqtt_icon.removeClass("fa-times fa-4x");
            mqtt_icon.addClass("fa-check fa-4x");
            mqtt_panel.removeClass("panel-red");
            mqtt_panel.addClass("panel-green");

            // Subscibe TOPIC
            // Ping Pong. Checking esp is alive?
            client.subscribe(ESP1_PING_TOPIC, {qos: 2});
            client.subscribe(ESP2_PING_TOPIC, {qos: 2});
            // sensor and switch status
            client.subscribe(ESP1_SENSOR_TOPIC, {qos: 2});
            client.subscribe(ESP1_LED_TOPIC, {qos: 2});
            client.subscribe(ESP2_SENSOR_TOPIC, {qos: 2});
            client.subscribe(ESP2_LED_TOPIC, {qos: 2});

            // Set default ping message
            publish("0", ESP1_PING_TOPIC, 2, true);
            publish("0", ESP2_PING_TOPIC, 2, true);
        },

        //Gets Called if the connection could not be established
        onFailure: function (message) {
            console.log("Connection failed: " + message.errorMessage);
            mqtt_status.text("ERROR");
            mqtt_icon.removeClass("fa-check fa-4x");
            mqtt_icon.addClass("fa-times fa-4x");
            mqtt_panal.removeClass("panel-green");
            mqtt_panel.addClass("panel-red");
        },

    };
     
    //Attempt to connect
    client.connect(options);

    var shift_data = function() {
        if(esp1_sensor_data.length>0 && esp2_sensor_data.length>0 ){
            var min = Math.max(esp1_sensor_data[0][0], esp2_sensor_data[0][0]);
            while(esp1_sensor_data.length>0 && esp1_sensor_data[0][0]<min) 
                esp1_sensor_data.shift();
            while(esp2_sensor_data.length>0 && esp2_sensor_data[0][0]<min) 
                esp2_sensor_data.shift();
        }
    }

    // Handle incomming subscibed Message from broker
    client.onMessageArrived = function (message) {
        var topic = message.destinationName;
        var payload = message.payloadString;

        console.log('Topic: ' + topic + '  | ' + payload);

        if(topic == ESP1_SENSOR_TOPIC) {
            esp1_sensor_data.push([new Date().getTime(), parseInt(payload,10)]);
            if(esp1_sensor_data.length>totalPoints) {
                esp1_sensor_data.shift();
                shift_data();
            }
            update();
        }else if(topic == ESP2_SENSOR_TOPIC) {
            esp2_sensor_data.push([new Date().getTime(), parseInt(payload,10)]);
            if(esp2_sensor_data.length>totalPoints){
                esp2_sensor_data.shift();
                shift_data();
            }
            update();
        }else if (topic==ESP1_LED_TOPIC) {
            if(payload == "1") {
                esp1_led_status.text("On");
                esp1_led_icon.removeClass("fa-toggle-off");
                esp1_led_icon.addClass("fa-toggle-on");
                esp1_led_panel.removeClass("panel-warning");
                esp1_led_panel.addClass("panel-green");
                esp1_led = true;
            }else{
                esp1_led_status.text("Off");
                esp1_led_icon.removeClass("fa-toggle-on");
                esp1_led_icon.addClass("fa-toggle-off");
                esp1_led_panel.removeClass("panel-green");
                esp1_led_panel.addClass("panel-warning");
                esp1_led = false;
            }
        }else if (topic==ESP2_LED_TOPIC) {
            if(payload == "1") {
                esp2_led_status.text("On");
                esp2_led_icon.removeClass("fa-toggle-off");
                esp2_led_icon.addClass("fa-toggle-on");
                esp2_led_panel.removeClass("panel-warning");
                esp2_led_panel.addClass("panel-green");
                esp2_led = true;
            }else{
                esp2_led_status.text("Off");
                esp2_led_icon.removeClass("fa-toggle-on");
                esp2_led_icon.addClass("fa-toggle-off");
                esp2_led_panel.removeClass("panel-green");
                esp2_led_panel.addClass("panel-warning");
                esp2_led = false;
            }
        }else if(topic == ESP1_PING_TOPIC) {
            if(payload == "iamalive") {
                if(esp1_offline>3) {
                    console.log("ESP1: Online");
                }
                esp1_status.text("Online");
                esp1_icon.removeClass("fa-times");
                esp1_icon.addClass("fa-check fa-4x");
                esp1_panel.removeClass("panel-red");
                esp1_panel.addClass("panel-green");
                esp1_led_panel.fadeIn();
                esp1_offline = 0;
            }

            
        }else if(topic == ESP2_PING_TOPIC) {
            if(payload == "iamalive") {
                if(esp2_offline>3) {
                    console.log("ESP2: Online");
                }
                esp2_status.text("Online");
                esp2_icon.removeClass("fa-times");
                esp2_icon.addClass("fa-check fa-4x");
                esp2_panel.removeClass("panel-red");
                esp2_panel.addClass("panel-green");
                esp2_led_panel.fadeIn();
                esp2_offline = 0;
            }
            
        }
    };

    // Public on/off message when toggle icon was clicked
    esp1_led_icon.click(function(){
        publish(esp1_led?"0":"1", ESP1_LED_TOPIC, 2, true);
    });

    esp2_led_icon.click(function(){
        publish(esp2_led?"0":"1", ESP2_LED_TOPIC, 2, true);
    });

    //Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
    var publish = function (payload, topic, qos=2, retained=false) {
        var message = new Messaging.Message(payload);
        message.destinationName = topic;
        message.qos = qos;
        message.retained = retained;
        client.send(message);
    }

    var offline_check = function() {
        esp1_offline++;
        esp2_offline++;
        if(esp1_offline>3){
            esp1_sensor_data = [];
            esp1_status.text("Offline");
            esp1_icon.addClass("fa-times fa-4x");
            esp1_icon.removeClass("fa-check");
            esp1_panel.addClass("panel-red");
            esp1_panel.removeClass("panel-green");
            esp1_led_panel.fadeOut();
            console.log("ESP1: Go Offline");
        }
        if(esp2_offline>3){
            esp2_sensor_data = [];
            esp2_status.text("Offline");
            esp2_icon.addClass("fa-times fa-4x");
            esp2_icon.removeClass("fa-check");
            esp2_panel.addClass("panel-red");
            esp2_panel.removeClass("panel-green");
            esp2_led_panel.fadeOut();
            console.log("ESP2: Go Offline");
        }
    };

    setInterval(offline_check, 1000);

});