<?php
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

  $settings = array();
  $settings["host"] = "http://localhost";
  $settings["baseURL"] = $settings["host"] . "/smeagol";
  $settings["proxyURL"] = $settings["baseURL"] . "/proxy.php?url=";
  $settings["baseEndpointURL"] = $settings["host"] . ":9998/smeagol/";
  $settings["discovererURL"] = $settings["baseURL"] . "/discoverer.html";
  $settings["finderURL"] = $settings["baseURL"] . "/finder.html";
?>
