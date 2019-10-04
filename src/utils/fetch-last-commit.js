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

import rp from 'request-promise-native';

/**
 * Tries to load the last commit for `<path>` from the github api.
 * @return {*} the meta props object or {@code {}}
 */
export default async (path, { secrets, request, logger }) => {
  const url = `https://api.github.com/repos/ramboz/helix-screens/commits?path=${path}&page=1&per_page=1`
  logger.info(`trying to load ${url}`)
  try {
    return await rp({
      url,
      transform: (data) => {
        return JSON.parse(data)[0]
      },
      headers: {
        'User-Agent': 'Helix-Screens',
      },
    })
  } catch (e) {
    logger.info('unable to load:', e)
    return Promise.resolve({})
  }
}
