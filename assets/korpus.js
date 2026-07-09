// Übungskorpus für die Station „LLM zum Anfassen“.
// Eigens geschriebener Text im Märchen- und Schulalltagsstil, bewusst mit
// wiederkehrenden Formulierungen: Je öfter eine Wortfolge vorkommt, desto
// sicherer wird die Vorhersage — genau das sollen die Lernenden entdecken.
const KORPUS = `
Es war einmal ein kleiner Drache, der in einem tiefen Wald lebte.
Es war einmal eine kluge Königin, die in einem alten Schloss lebte.
Es war einmal ein kleiner Fuchs, der in einem tiefen Wald wohnte.
Es war einmal eine mutige Prinzessin, die in einem alten Turm wohnte.
Der kleine Drache ging in den tiefen Wald und suchte einen Schatz.
Der kleine Fuchs ging in den tiefen Wald und suchte eine Freundin.
Die kluge Königin ging in den großen Saal und suchte einen Rat.
Die mutige Prinzessin ging in den dunklen Keller und suchte einen Schatz.
Eines Tages fand der kleine Drache einen goldenen Schlüssel.
Eines Tages fand die mutige Prinzessin eine geheime Tür.
Eines Tages fand der kleine Fuchs einen goldenen Ring.
Der goldene Schlüssel passte in die geheime Tür.
Hinter der geheimen Tür lag ein großer Schatz.
Hinter der alten Mauer lag ein kleiner Garten.
Der Drache und der Fuchs wurden gute Freunde.
Die Königin und die Prinzessin wurden gute Freundinnen.
Und wenn sie nicht gestorben sind, dann leben sie noch heute.
Und wenn sie nicht müde sind, dann spielen sie noch heute.

Die Schule beginnt am Montag um acht Uhr.
Die Schule beginnt am Dienstag um acht Uhr.
Der Unterricht beginnt am Montag um acht Uhr im Klassenzimmer.
Der Unterricht endet am Freitag um ein Uhr.
Die Schülerinnen und Schüler lernen heute etwas über künstliche Intelligenz.
Die Schülerinnen und Schüler lernen heute etwas über Wahrscheinlichkeiten.
Die Schülerinnen und Schüler schreiben morgen eine Klassenarbeit.
Die Lehrerin erklärt der Klasse ein neues Thema.
Der Lehrer erklärt der Klasse eine neue Aufgabe.
Die Lehrerin stellt der Klasse eine schwierige Frage.
Eine künstliche Intelligenz berechnet die Wahrscheinlichkeit für das nächste Wort.
Eine künstliche Intelligenz kennt keine Wahrheit, sondern nur Wahrscheinlichkeiten.
Das Sprachmodell berechnet die Wahrscheinlichkeit für das nächste Wort.
Das Sprachmodell rät das nächste Wort aus den Daten.
Je mehr Daten das Modell sieht, desto besser wird die Vorhersage.
Je mehr Beispiele das Modell sieht, desto sicherer wird die Vorhersage.
In der Pause spielen die Kinder auf dem Schulhof.
In der Pause essen die Kinder auf dem Schulhof.
Nach der Schule gehen die Kinder nach Hause.
Nach der Schule gehen die Kinder auf den Sportplatz.
Am Wochenende scheint hoffentlich die Sonne.
Am Wochenende regnet es hoffentlich nicht.
`;
