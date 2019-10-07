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

import fetchInRepo from './fetch-in-repo'

/**
 * Tries to load the `<path>.md` from the content repository.
 * @return {*} the meta props object or {@code {}}
 */
export default async (mdPath, action) => {
  return await fetchInRepo(mdPath, {
    transform: (data, res) => {
      const props = { md: data }
      try { 
        props.etag = JSON.parse(res.headers.etag || null)
      } catch (e) {
        props.etag = res.headers.etag
      }
      return props
    }
  }, action)
}
