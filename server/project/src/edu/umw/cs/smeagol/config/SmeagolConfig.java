package edu.umw.cs.smeagol.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public final class SmeagolConfig  {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private static final SmeagolConfig instance = new SmeagolConfig();
    private Properties properties;

    private SmeagolConfig() {
        properties = new Properties();
        InputStream in = getClass().getResourceAsStream("smeagol.properties");
        try {
            properties.load(in);
            in.close();
        } catch (IOException ex) {
            logger.error("Error loading properties: {}", ex.getMessage());
        }
    }

    public static SmeagolConfig getInstance() {
        return instance;
    }

    public String get(String key) {
        return properties.getProperty(key);
    }

    public String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}
