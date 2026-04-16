const app = Vue.createApp({
  data() {
    return {
      serviceId: "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
      characteristicId: "beb5483e-36e1-4688-b7f5-ea07361b26a8",
      myCharacteristic: null,
      dec: new TextDecoder(),
      enc: new TextEncoder(),
      messageToSend: "",
      receivedMessages: [],
      SoilMoisture: "None",
      Temperature: "None",
      AirMoisture: "None",
      plantImage: "Chat\\ Plant.png",
      needWaterText: "Unkown",
    };
  },
  mounted() {
    this.setupEventListeners();

    setInterval(() => {
      if (this.myCharacteristic) {
        this.receiveMessage();
      }
    }, 2000);
  },

  methods: {
    setupEventListeners() {
      const connectButton = document.getElementById("connect");
      connectButton.addEventListener("click", this.connect);
    },
    connect() {
      navigator.bluetooth
        .requestDevice({
          filters: [{ services: [this.serviceId] }],
        })
        .then((device) => device.gatt.connect())
        .then((server) => server.getPrimaryService(this.serviceId))
        .then((service) => service.getCharacteristic(this.characteristicId))
        .then((characteristic) => {
          this.myCharacteristic = characteristic;
          console.log("Bluetooth device connected");
        })
        .catch((error) => {
          console.error("Bluetooth connection failed", error);
        });
    },
    sendMessage() {
      if (!this.myCharacteristic) {
        console.log("No Bluetooth device connected");
        return;
      }
      this.myCharacteristic
        .writeValue(this.enc.encode(this.messageToSend))
        .then(() => {
          console.log("Message sent");
        })
        .catch((error) => {
          console.error("Failed to send message", error);
        });
    },
    receiveMessage() {
      if (!this.myCharacteristic) {
        console.log("No Bluetooth device connected");
        return;
      }
      this.myCharacteristic
        .readValue()
        .then((value) => {
          const receivedMessage = this.dec.decode(value);
          const dataPoints = receivedMessage.split(",");
          if (dataPoints.length >= 3) {
            this.SoilMoisture = parseFloat(dataPoints[0]);
            this.Temperature =
              ((parseFloat(dataPoints[1]) * 9) / 5 + 32).toFixed(2) + " F";
            this.AirMoisture = dataPoints[2];
            this.updateWaterStatus(this.SoilMoisture);
          }
          console.log(
            "Data received:",
            this.SoilMoisture,
            this.Temperature,
            this.AirMoisture
          );
        })
        .catch((error) => {
          console.error("Failed to receive message", error);
        });
    },
    updateWaterStatus(moisture) {
      const waterStatusDiv = document.querySelector(".water-status");
      const needWaterText = waterStatusDiv.querySelector("h4");

      if (moisture < 990) {
        needWaterText.textContent = "Yes";
        waterStatusDiv.classList.remove("medium-moisture", "high-moisture");
        waterStatusDiv.classList.add("low-moisture");
        this.plantImage = "drydeadplant.jpeg";
        this.needWaterText = "Yes";
      } else {
        needWaterText.textContent = "No";
        waterStatusDiv.classList.remove("low-moisture", "medium-moisture");
        waterStatusDiv.classList.add("high-moisture");
        this.needWaterText = "No";
        this.plantImage = "Chat\\ Plant.png";
      }
    },
    update() {
      this.receiveMessage();
    },
  },
});

app.mount("#app");
