<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Alleen POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Ongeldige methode."]);
    exit;
}

// Input ophalen en sanitizen
$name    = trim(htmlspecialchars($_POST["name"]    ?? ""));
$email   = trim(htmlspecialchars($_POST["email"]   ?? ""));
$message = trim(htmlspecialchars($_POST["message"] ?? ""));

// Validatie
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(["success" => false, "message" => "Alle velden zijn verplicht."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Ongeldig e-mailadres."]);
    exit;
}

// Jouw e-mailadres
$to      = "jouw@emailadres.nl";
$subject = "Portfolio Contact: " . $name;
$body    = "Naam: $name\nEmail: $email\n\nBericht:\n$message";
$headers = "From: noreply@jouwdomain.nl\r\nReply-To: $email";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Mail kon niet worden verzonden."]);
}
?>
