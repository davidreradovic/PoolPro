-- Prvo brišemo tabelu ako već postoji
DROP TABLE IF EXISTS item_photo;

-- Ponovno kreiranje tabele sa svim relacijama
CREATE TABLE item_photo (
    iditem_photo INT NOT NULL AUTO_INCREMENT,
    img_path VARCHAR(255) NOT NULL,
    title VARCHAR(45) NOT NULL,
    item_id_item INT NOT NULL,
    PRIMARY KEY (iditem_photo),
    INDEX fk_item_photo_item_idx (item_id_item),
    CONSTRAINT fk_item_photo_item
        FOREIGN KEY (item_id_item)
        REFERENCES item (id_item)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Izmjena kolone u tabeli photo
ALTER TABLE photo
CHANGE COLUMN img img_path VARCHAR(255);
