-- Add new fields to tutor_profiles table using a procedure to handle existing columns

DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDefinition VARCHAR(1000)
)
BEGIN
    DECLARE columnExists INT;
    
    SELECT COUNT(*) INTO columnExists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND COLUMN_NAME = columnName;
    
    IF columnExists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

DELIMITER ;

-- Add the new columns
CALL AddColumnIfNotExists('tutor_profiles', 'university', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('tutor_profiles', 'program', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('tutor_profiles', 'academic_year', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('tutor_profiles', 'school_email', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('tutor_profiles', 'grade_levels', 'TEXT NULL');

-- Drop the procedure
DROP PROCEDURE AddColumnIfNotExists;
