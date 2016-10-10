int led = 13;

void setup() {
  pinMode(led, OUTPUT);

  Serial1.begin(57600);
}

void loop() {
  while (Serial1.available() > 0) {
    digitalWrite(led, HIGH);
    Serial1.print(Serial1.read());
    delay(50);
    digitalWrite(led, LOW);
    delay(50);
  }
  delay(200);
}
