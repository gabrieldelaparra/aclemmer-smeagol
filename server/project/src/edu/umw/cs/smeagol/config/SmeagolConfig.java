/******************************************************************************
    Smeagol
    Copyright (C) 2010-2011  Aaron Clemmer, Stephen Davies

    This file is part of Smeagol.

    Smeagol is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/
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
