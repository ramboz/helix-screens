/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const getQueryParams = (req) => {
    return req.queryString.replace(/^\?/, '').split('&').reduce((params, str) => {
        const param = str.split('=')
        params[param[0]] = param[1]
        return params
    }, {})
}

export default (req) => {
    const params = getQueryParams(req)
    const deviceId = decodeURIComponent(params.id);
    return deviceId.indexOf('/') === 0 ? deviceId : `/content/screens/devices/${deviceId}`
}