/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const map = require('unist-util-map')

/**
 * The 'pre' function that is executed before the HTML is rendered
 * @param context The current context of processing pipeline
 * @param context.content The content
 */
function pre(context, action) {
    map(context.content.mdast, (node) => {
        if (node.type === 'html' && node.value.indexOf('<video') === 0) {
            if (!node.types) {
                node.types = []
            }
            node.types.push('is-video')
            const matches = "<video src=\"/assets/video.mp4\" alt=\"\">".match(/src="(.*?)"/)
            node.url = matches && matches[1]
        }
        return node
    })
}

module.exports.pre = pre
