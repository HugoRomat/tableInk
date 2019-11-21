export const addSketchLine = data => ({
    type: 'ADD_SKETCH_LINE',
    data
})

export const createGroupLines = data => ({
    type: 'CREATE_GROUP_LINES',
    data
})

export const addStickyLines = data => ({
    type: 'CREATE_STICKY_LINES',
    data
})

export const removeSketchLines = data => ({
    type: 'REMOVE_SKETCH_LINES',
    data
})
export const addLinesClass = data => ({
    type: 'ADD_LINES_CLASS',
    data
})
export const addLinesToSticky = data => ({
    type: 'ADD_LINES_TO_STICKY',
    data
})
export const shouldOpenMenu = data => ({
    type: 'SHOULD_OPEN_MENU',
    data
})

export const addLineToStickyGroup = data => ({
    type: 'ADD_LINE_TO_STICKY_GROUP',
    data
})

export const moveSketchLines = data => ({
    type: 'MOVE_SKETCH_LINES',
    data
})
export const changeModelGroupLines = data => ({
    type: 'CHANGE_MODEL_GROUP_LINES',
    data
})
