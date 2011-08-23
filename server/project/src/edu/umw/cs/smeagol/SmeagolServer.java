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
/*
/*
 * To set the port, either set the environment variable SMEAGOL_HTTP_PORT, or
 * configure the "port" property in edu/umw/cs/smeagol/config/smeagol.properties
 */
package edu.umw.cs.smeagol;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import javax.ws.rs.core.UriBuilder;

import com.sun.grizzly.http.SelectorThread;
import com.sun.jersey.api.container.grizzly.GrizzlyWebContainerFactory;
import com.sun.jersey.api.core.ClassNamesResourceConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.config.SmeagolConfig;


public class SmeagolServer {
    public static final URI BASE_URI = getBaseURI();
    
    private static int getPort(int defaultPort) {
        String port = System.getenv("SMEAGOL_HTTP_PORT");
        if (null != port) {
            try {
                return Integer.parseInt(port);
            } catch (NumberFormatException e) {
            }
        }
        return defaultPort;
    }

    private static URI getBaseURI() {
        return UriBuilder.fromUri("http://" + SmeagolConfig.getInstance().get("host") + "/").port(getPort(Integer.parseInt(SmeagolConfig.getInstance().get("port")))).build();
    }

    protected static SelectorThread startServer() throws IOException {
        final Map<String, String> initParams = new HashMap<String, String>();

        initParams.put("com.sun.jersey.config.property.classnames", edu.umw.cs.smeagol.resources.SmeagolResource.class.getCanonicalName());
        initParams.put("com.sun.jersey.config.property.resourceConfigClass", ClassNamesResourceConfig.class.getName());

        System.out.println("Starting grizzly...");
        SelectorThread threadSelector = GrizzlyWebContainerFactory.create(BASE_URI, initParams);
        threadSelector.setUseChunking(false);
        return threadSelector;
    }

    public static void main(String[] args) throws IOException {
        try {
        SelectorThread threadSelector = startServer();
        System.out.println(String.format("Smeagol server started with WADL available at "
                + "%sapplication.wadl\nHit enter to stop it...",
                BASE_URI, BASE_URI));

        System.in.read();
        threadSelector.stopEndpoint();
        }
        catch (Exception e) {
            LoggerFactory.getLogger("main").error("Exception: {}", e);
        }
    }    
}
