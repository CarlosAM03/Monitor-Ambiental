USE master;
GO

------------------------------------------------------------
--  LIMPIEZA PREVIA (si ya existe la base o el login)
------------------------------------------------------------
IF DB_ID('MonitorAmbientalDB') IS NOT NULL
BEGIN
    ALTER DATABASE MonitorAmbientalDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE MonitorAmbientalDB;
    PRINT ' Base de datos anterior eliminada.';
END
GO

IF EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'monitor_admin')
BEGIN
    -- Cerrar conexiones activas
    DECLARE @sql NVARCHAR(MAX) = N'';
    SELECT @sql += 'KILL ' + CAST(session_id AS NVARCHAR(10)) + ';'
    FROM sys.dm_exec_sessions WHERE login_name = 'monitor_admin';
    EXEC(@sql);
    
    DROP LOGIN monitor_admin;
    PRINT ' Login anterior eliminado.';
END
GO

------------------------------------------------------------
--  CREACION DE BASE DE DATOS Y LOGIN
------------------------------------------------------------
CREATE DATABASE MonitorAmbientalDB;
GO

USE MonitorAmbientalDB;
GO

-- Crear login a nivel de servidor
CREATE LOGIN monitor_admin WITH PASSWORD = 'monitorKey01', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
GO

-- Crear usuario dentro de la base
CREATE USER monitor_admin FOR LOGIN monitor_admin;
GO

-- Otorgar permisos completos dentro de la base
ALTER ROLE db_owner ADD MEMBER monitor_admin;
GO

------------------------------------------------------------
--  TABLAS PRINCIPALES
------------------------------------------------------------

-- Tabla de lecturas de sensor (temperatura y humedad)
CREATE TABLE LecturasSensor (
    IdLectura INT IDENTITY(1,1) PRIMARY KEY,
    FechaHora DATETIME NOT NULL DEFAULT GETDATE(),
    Temperatura FLOAT NOT NULL,
    Humedad FLOAT NOT NULL,
    IndiceTermico FLOAT NULL,
    Origen VARCHAR(50) DEFAULT 'raspberry1'
);
GO

-- Tabla de par�metros de configuraci�n ambiental
CREATE TABLE ParametrosConfiguracion (
    IdConfig INT IDENTITY(1,1) PRIMARY KEY,
    TempLimite FLOAT NOT NULL,
    HumedadLimite FLOAT NOT NULL,
    IndiceTermicoLimite FLOAT NOT NULL,
    IntervaloSegundos INT NOT NULL,
    Ancho FLOAT NOT NULL,
    Largo FLOAT NOT NULL,
    Alto FLOAT NOT NULL,
    PersonasMin INT NOT NULL,
    PersonasMax INT NOT NULL,
    TipoMaterial VARCHAR(50) NOT NULL,
    CantidadMateriales INT NOT NULL,
    DimMaterialAncho FLOAT NOT NULL,
    DimMaterialLargo FLOAT NOT NULL,
    DimMaterialAlto FLOAT NOT NULL,
    FechaRegistro DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);
GO

------------------------------------------------------------
--  CONFIGURACI�N INICIAL DE EJEMPLO
------------------------------------------------------------
INSERT INTO ParametrosConfiguracion
(TempLimite, HumedadLimite, IndiceTermicoLimite, IntervaloSegundos,
Ancho, Largo, Alto, PersonasMin, PersonasMax, TipoMaterial,
CantidadMateriales, DimMaterialAncho, DimMaterialLargo, DimMaterialAlto, Activo)
VALUES
(35, 65, 38, 1,
5.0, 8.0, 3.0, 2, 5, 'electronic',
50, 0.3, 0.3, 0.3, 1);
GO



-- Revisi�n r�pida
SELECT name, type_desc FROM sys.database_principals WHERE name = 'monitor_admin';
SELECT * FROM ParametrosConfiguracion;
GO

select * FROM LecturasSensor;


USE MonitorAmbientalDB;
SELECT TOP 10 * FROM LecturasSensor ORDER BY IdLectura DESC;


USE MonitorAmbientalDB;
UPDATE ParametrosConfiguracion
SET Activo = 0 WHERE Activo = 1;

INSERT INTO ParametrosConfiguracion (
  TempLimite, HumedadLimite, IndiceTermicoLimite, IntervaloSegundos,
  Ancho, Largo, Alto, PersonasMin, PersonasMax, TipoMaterial,
  CantidadMateriales, DimMaterialAncho, DimMaterialLargo, DimMaterialAlto, Activo
)
VALUES (30, 70, 35, 3, 5, 8, 3, 1, 3, 'electronic', 10, 0.3, 0.3, 0.2, 1);
