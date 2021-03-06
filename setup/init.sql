DROP DATABASE IF EXISTS Guardian;
CREATE DATABASE Guardian;

USE Guardian;

DROP TABLE IF EXISTS User;
CREATE TABLE User (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nickname VARCHAR(20) NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS Pet;
CREATE TABLE Pet (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    species VARCHAR(10) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    imageUrl TINYTEXT NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS UserPetHistory;
CREATE TABLE UserPetHistory (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    userID INT UNSIGNED NOT NULL,
    petID INT UNSIGNED NOT NULL,
    registeredAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    releasedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    released TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (userID) REFERENCES User(id),
    FOREIGN KEY (petID) REFERENCES Pet(id)
);
