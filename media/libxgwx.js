/* @ts-self-types="./libxgwx.d.ts" */

/**
 * Probe whether this container can be rewritten without returning probe bytes.
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function check_xgwx_edit_support(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.check_xgwx_edit_support(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Connect adjacent IEC groups, rebuilding group envelopes and adding wiring.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} upper_group_index
 * @param {number} expected_upper_row
 * @param {number} lower_group_index
 * @param {number} expected_lower_row
 * @param {number} x
 * @returns {Uint8Array}
 */
export function connect_xgwx_iec_ld_groups(bytes, program_index, upper_group_index, expected_upper_row, lower_group_index, expected_lower_row, x) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.connect_xgwx_iec_ld_groups(ptr0, len0, program_index, upper_group_index, expected_upper_row, lower_group_index, expected_lower_row, x);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Copy one complete decoded IEC LD network into an empty row range.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} expected_first_row_index
 * @param {number} destination_first_row_index
 * @returns {Uint8Array}
 */
export function copy_xgwx_iec_ld_group(bytes, program_index, group_index, expected_first_row_index, destination_first_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.copy_xgwx_iec_ld_group(ptr0, len0, program_index, group_index, expected_first_row_index, destination_first_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Copy a contact/coil IEC network from another program into an empty row range.
 * @param {Uint8Array} bytes
 * @param {number} source_program_index
 * @param {number} group_index
 * @param {number} expected_first_row_index
 * @param {number} destination_program_index
 * @param {number} destination_first_row_index
 * @returns {Uint8Array}
 */
export function copy_xgwx_iec_ld_group_to_program(bytes, source_program_index, group_index, expected_first_row_index, destination_program_index, destination_first_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.copy_xgwx_iec_ld_group_to_program(ptr0, len0, source_program_index, group_index, expected_first_row_index, destination_program_index, destination_first_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Copy an IEC network and its missing supported local declarations.
 * @param {Uint8Array} bytes
 * @param {number} source_program_index
 * @param {number} group_index
 * @param {number} expected_first_row_index
 * @param {number} destination_program_index
 * @param {number} destination_first_row_index
 * @returns {Uint8Array}
 */
export function copy_xgwx_iec_ld_group_to_program_with_locals(bytes, source_program_index, group_index, expected_first_row_index, destination_program_index, destination_first_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.copy_xgwx_iec_ld_group_to_program_with_locals(ptr0, len0, source_program_index, group_index, expected_first_row_index, destination_program_index, destination_first_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Return the cataloged XGK, XGB, and XGI CPU models.
 * @returns {any}
 */
export function cpu_catalog() {
    const ret = wasm.cpu_catalog();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Delete one implicit IEC LD blank row, matching XG5000 Ctrl+D coordinate
 * shifting while rejecting rows referenced by decoded records.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} blank_row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_blank_row(bytes, program_index, blank_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_blank_row(ptr0, len0, program_index, blank_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Remove a scalar branch-mounted block while retaining its branch rows.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_branch_function(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_branch_function(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete the upper line of a captured two-row IEC branch.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_branch_top_row(bytes, program_index, group_index, row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_branch_top_row(ptr0, len0, program_index, group_index, row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete a scalar arithmetic block while retaining its external branch spine.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_branched_arithmetic(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_branched_arithmetic(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete a contact-only middle row in a native-shaped x3 branch chain.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_chained_contact_branch_row(bytes, program_index, group_index, row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_chained_contact_branch_row(ptr0, len0, program_index, group_index, row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete the captured connected ADD while preserving its neighboring circuits.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_connected_arithmetic(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_connected_arithmetic(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete one decoded contact in the captured linear IEC LD shape.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_offset
 * @param {number} expected_raw_x
 * @param {string} expected_contact_kind
 * @param {string} expected_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_contact(bytes, program_index, contact_offset, expected_raw_x, expected_contact_kind, expected_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_contact(ptr0, len0, program_index, contact_offset, expected_raw_x, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Delete one decoded linear-row contact with native XG5000 Cell Delete semantics.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_offset
 * @param {number} expected_raw_x
 * @param {string} expected_contact_kind
 * @param {string} expected_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_contact_cell(bytes, program_index, contact_offset, expected_raw_x, expected_contact_kind, expected_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_contact_cell(ptr0, len0, program_index, contact_offset, expected_raw_x, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Delete a middle IEC row containing only a vertical branch end and start.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_empty_branch_row(bytes, program_index, group_index, row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_empty_branch_row(ptr0, len0, program_index, group_index, row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete the captured head EQ and close its pin-row gap in the comparison chain.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_eq_chain_head(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_eq_chain_head(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete the captured FF branch output line and its connected FF block.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_ff_branch_output_row(bytes, program_index, group_index, row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_ff_branch_output_row(ptr0, len0, program_index, group_index, row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete one captured connected IEC function cell while retaining the other
 * records in its stored rows.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_function_cell(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_function_cell(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Remove one complete decoded IEC LD network, leaving its rows blank.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} expected_first_row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_group(bytes, program_index, group_index, expected_first_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_group(ptr0, len0, program_index, group_index, expected_first_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete the captured contact-fed L62 comparison and its x6/x12 branches.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_heating_chain_contact_eq(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_heating_chain_contact_eq(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete the native-validated first comparison block in the heating chain.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_heating_chain_head(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_heating_chain_head(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete either native-validated middle EQ block in the heating chain.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_heating_chain_middle(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_heating_chain_middle(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete either captured x15-fed comparison at L66 or L70.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_heating_chain_x15_eq(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_heating_chain_x15_eq(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete the L58 EQ and its dangling feed, yielding a valid circuit.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_heating_chain_x3_eq_repaired(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_heating_chain_x3_eq_repaired(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Remove one captured IEC short wire between two long-wire fragments.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} wire_offset
 * @param {number} expected_raw_x
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_horizontal_wire(bytes, program_index, wire_offset, expected_raw_x) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_horizontal_wire(ptr0, len0, program_index, wire_offset, expected_raw_x);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete one captured normally-open-contact to output-coil rung and restore
 * its row to an implicit blank gap.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {string} expected_contact_variable
 * @param {string} expected_coil_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_linear_rung(bytes, program_index, row_index, expected_contact_variable, expected_coil_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_linear_rung(ptr0, len0, program_index, row_index, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Delete a native-shaped contact-only middle row in a nested IEC branch.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} row_index
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_nested_contact_branch_row(bytes, program_index, group_index, row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_nested_contact_branch_row(ptr0, len0, program_index, group_index, row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Delete one normally open contact in the captured linear IEC LD shape.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_offset
 * @param {number} expected_raw_x
 * @param {string} expected_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_no_contact(bytes, program_index, contact_offset, expected_raw_x, expected_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_no_contact(ptr0, len0, program_index, contact_offset, expected_raw_x, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete one linear-row contact with native XG5000 Cell Delete semantics.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_offset
 * @param {number} expected_raw_x
 * @param {string} expected_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_no_contact_cell(bytes, program_index, contact_offset, expected_raw_x, expected_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_no_contact_cell(ptr0, len0, program_index, contact_offset, expected_raw_x, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete one exact addressed-contact to coil rung, restoring an implicit gap.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {string} expected_contact_kind
 * @param {string} expected_contact_variable
 * @param {string} expected_coil_kind
 * @param {string} expected_coil_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_rung(bytes, program_index, row_index, expected_contact_kind, expected_contact_variable, expected_coil_kind, expected_coil_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(expected_coil_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(expected_coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_rung(ptr0, len0, program_index, row_index, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v6 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v6;
}

/**
 * Delete one scalar body from a shared-row horizontal chain.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_scalar_chain_function(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_scalar_chain_function(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete an occupied simple IEC LD row and shift later lines up.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {string} expected_contact_kind
 * @param {string} expected_contact_variable
 * @param {string} expected_coil_kind
 * @param {string} expected_coil_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_simple_row(bytes, program_index, row_index, expected_contact_kind, expected_contact_variable, expected_coil_kind, expected_coil_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(expected_coil_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(expected_coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_simple_row(ptr0, len0, program_index, row_index, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v6 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v6;
}

/**
 * Delete one captured standalone IEC function group, leaving its stored rows
 * as an implicit blank gap.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_standalone_function(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_standalone_function(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Remove the terminal wire and coil from a one-row IEC rung.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} coil_record_offset
 * @param {string} expected_variable
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_terminal_coil(bytes, program_index, coil_record_offset, expected_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_terminal_coil(ptr0, len0, program_index, coil_record_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete one captured terminal IEC function block and its otherwise empty
 * pin rows while preserving the leading contact.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_ld_terminal_function(bytes, program_index, block_offset, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_ld_terminal_function(ptr0, len0, program_index, block_offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Remove an unreferenced IEC program-local symbol.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} symbol_index
 * @param {string} expected_name
 * @returns {Uint8Array}
 */
export function delete_xgwx_iec_local_symbol(bytes, program_index, symbol_index, expected_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_iec_local_symbol(ptr0, len0, program_index, symbol_index, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete a verified XGK comparison contact and its operand references.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @returns {Uint8Array}
 */
export function delete_xgwx_ladder_comparison(bytes, program_index, offset, expected) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_ladder_comparison(ptr0, len0, program_index, offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete a verified XGK application from an unbranched output row.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @returns {Uint8Array}
 */
export function delete_xgwx_ladder_instruction(bytes, program_index, offset, expected) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_ladder_instruction(ptr0, len0, program_index, offset, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete a supported native rung comment.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} raw_y
 * @param {string} expected
 * @returns {Uint8Array}
 */
export function delete_xgwx_ladder_rung_comment(bytes, program_index, raw_y, expected) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_ladder_rung_comment(ptr0, len0, program_index, raw_y, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Delete one module and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @returns {Uint8Array}
 */
export function delete_xgwx_module(bytes, base, slot) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.delete_xgwx_module(ptr0, len0, base, slot);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Give one captured IEC function block a separate local instance.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_instance
 * @param {string} new_instance
 * @returns {Uint8Array}
 */
export function duplicate_xgwx_iec_ld_function_instance(bytes, program_index, block_offset, expected_instance, new_instance) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_instance, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(new_instance, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.duplicate_xgwx_iec_ld_function_instance(ptr0, len0, program_index, block_offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Bounded hardware form edit with stale-field and full-container validation.
 * @param {Uint8Array} bytes
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function edit_xgwx_browser_hardware(bytes, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_browser_hardware(ptr0, len0, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply one strictly bounded IEC demo edit with payload preservation checks.
 * @param {Uint8Array} bytes
 * @param {number} index
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function edit_xgwx_browser_iec(bytes, index, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_browser_iec(ptr0, len0, index, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply one bounded existing network metadata field.
 * @param {Uint8Array} bytes
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function edit_xgwx_browser_network(bytes, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_browser_network(ptr0, len0, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply a batch of native Cnet serial-port changes atomically.
 * @param {Uint8Array} bytes
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function edit_xgwx_cnet_settings(bytes, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_cnet_settings(ptr0, len0, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply supported changes to one network and return rewritten bytes.
 * @param {Uint8Array} bytes
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function edit_xgwx_fenet_field(bytes, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_fenet_field(ptr0, len0, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Add or remove one guarded IEC LD vertical branch segment between adjacent
 * rows, including the captured contact-only final-branch row shape.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} start_row_index
 * @param {number} end_row_index
 * @param {number} x
 * @param {boolean} expected
 * @param {boolean} present
 * @returns {Uint8Array}
 */
export function edit_xgwx_iec_ld_branch_segment(bytes, program_index, group_index, start_row_index, end_row_index, x, expected, present) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_iec_ld_branch_segment(ptr0, len0, program_index, group_index, start_row_index, end_row_index, x, expected, present);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Toggle a vertical wire without deleting shared row or function records.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} start_row_index
 * @param {number} end_row_index
 * @param {number} x
 * @param {boolean} expected
 * @param {boolean} present
 * @returns {Uint8Array}
 */
export function edit_xgwx_iec_ld_vertical_wire(bytes, program_index, group_index, start_row_index, end_row_index, x, expected, present) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_iec_ld_vertical_wire(ptr0, len0, program_index, group_index, start_row_index, end_row_index, x, expected, present);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Add or remove a supported vertical branch connection.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {any} edit
 * @returns {Uint8Array}
 */
export function edit_xgwx_ladder_branch(bytes, program_index, edit) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_ladder_branch(ptr0, len0, program_index, edit);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Structurally edit a supported LD contact or coil at a physical cell.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {any} edit
 * @returns {Uint8Array}
 */
export function edit_xgwx_ladder_cell(bytes, program_index, edit) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_ladder_cell(ptr0, len0, program_index, edit);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Create or edit a supported native rung/output comment.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {any} edit
 * @returns {Uint8Array}
 */
export function edit_xgwx_ladder_comment(bytes, program_index, edit) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.edit_xgwx_ladder_comment(ptr0, len0, program_index, edit);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Extend an IEC group into the adjacent implicit blank row.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} start_row_index
 * @param {number} x
 * @returns {Uint8Array}
 */
export function extend_xgwx_iec_ld_vertical_wire(bytes, program_index, group_index, start_row_index, x) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.extend_xgwx_iec_ld_vertical_wire(ptr0, len0, program_index, group_index, start_row_index, x);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Insert one implicit IEC LD blank row after a decoded stored row, matching
 * XG5000 Ctrl+L coordinate shifting.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} after_row_index
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_blank_row(bytes, program_index, after_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_blank_row(ptr0, len0, program_index, after_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Add a standalone comment to one empty IEC LD row.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} destination_row_index
 * @param {string} text
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_comment(bytes, program_index, destination_row_index, text) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_comment(ptr0, len0, program_index, destination_row_index, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Insert one of the four decoded contact kinds into a captured linear IEC LD wire.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} wire_offset
 * @param {number} raw_x
 * @param {number} expected_wire_start_x
 * @param {number} expected_wire_end_x
 * @param {string} contact_kind
 * @param {string} variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_contact(bytes, program_index, wire_offset, raw_x, expected_wire_start_x, expected_wire_end_x, contact_kind, variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_contact(ptr0, len0, program_index, wire_offset, raw_x, expected_wire_start_x, expected_wire_end_x, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Place one verified scalar IEC function with operands in reference order.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {number} raw_x
 * @param {string} name
 * @param {string} operands_json
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_function(bytes, program_index, row_index, raw_x, name, operands_json) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(operands_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_function(ptr0, len0, program_index, row_index, raw_x, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert the captured connected single-output FF function cell.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} insertion_offset
 * @param {string} function_name
 * @param {string} instance_name
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_function_cell(bytes, program_index, insertion_offset, function_name, instance_name) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(function_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(instance_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_function_cell(ptr0, len0, program_index, insertion_offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert an addressed contact into a captured upper-branch x1 gap.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} insertion_offset
 * @param {string} contact_kind
 * @param {string} variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_leading_contact(bytes, program_index, insertion_offset, contact_kind, variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_leading_contact(ptr0, len0, program_index, insertion_offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Create one native-shaped normally-open-contact to output-coil rung in an
 * unoccupied implicit IEC LD row.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} blank_row_index
 * @param {string} contact_variable
 * @param {string} coil_variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_linear_rung(bytes, program_index, blank_row_index, contact_variable, coil_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_linear_rung(ptr0, len0, program_index, blank_row_index, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert one normally open contact into a captured linear IEC LD wire.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} wire_offset
 * @param {number} raw_x
 * @param {number} expected_wire_start_x
 * @param {number} expected_wire_end_x
 * @param {string} variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_no_contact(bytes, program_index, wire_offset, raw_x, expected_wire_start_x, expected_wire_end_x, variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_no_contact(ptr0, len0, program_index, wire_offset, raw_x, expected_wire_start_x, expected_wire_end_x, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Add a normally open contact in parallel with a captured simple IEC rung.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {string} expected_contact_variable
 * @param {string} expected_coil_variable
 * @param {string} parallel_variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_parallel_contact(bytes, program_index, row_index, expected_contact_variable, expected_coil_variable, parallel_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(parallel_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_parallel_contact(ptr0, len0, program_index, row_index, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Add one of the addressed IEC contact kinds on a lower parallel branch.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {string} expected_contact_variable
 * @param {string} expected_coil_variable
 * @param {string} parallel_kind
 * @param {string} parallel_variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_parallel_contact_kind(bytes, program_index, row_index, expected_contact_variable, expected_coil_variable, parallel_kind, parallel_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(parallel_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(parallel_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_parallel_contact_kind(ptr0, len0, program_index, row_index, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v6 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v6;
}

/**
 * Create one addressed-contact to coil rung using decoded IEC element kinds.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} blank_row_index
 * @param {string} contact_kind
 * @param {string} contact_variable
 * @param {string} coil_kind
 * @param {string} coil_variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_rung(bytes, program_index, blank_row_index, contact_kind, contact_variable, coil_kind, coil_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(coil_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_rung(ptr0, len0, program_index, blank_row_index, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v6 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v6;
}

/**
 * Replace a captured IEC one-cell wire with an addressed contact.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} wire_offset
 * @param {number} expected_raw_x
 * @param {string} contact_kind
 * @param {string} variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_short_wire_contact(bytes, program_index, wire_offset, expected_raw_x, contact_kind, variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(contact_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_short_wire_contact(ptr0, len0, program_index, wire_offset, expected_raw_x, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert one contact or coil into an empty IEC cell, without adding other elements.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} row_index
 * @param {number} raw_x
 * @param {string} category
 * @param {string} kind
 * @param {string} operand
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_single_element(bytes, program_index, row_index, raw_x, category, kind, operand) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(category, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(operand, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_single_element(ptr0, len0, program_index, row_index, raw_x, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Restore the captured standalone WORD_TO_UDINT group and operand binding.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} insertion_offset
 * @param {string} function_name
 * @param {string} input_operand
 * @param {string} output_operand
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_standalone_function(bytes, program_index, insertion_offset, function_name, input_operand, output_operand) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(function_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(input_operand, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(output_operand, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_standalone_function(ptr0, len0, program_index, insertion_offset, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Complete a contact-only one-row IEC rung with a wire and BOOL coil.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_record_offset
 * @param {string} expected_contact_variable
 * @param {string} coil_kind
 * @param {string} coil_variable
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_terminal_coil(bytes, program_index, contact_record_offset, expected_contact_variable, coil_kind, coil_variable) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_contact_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(coil_kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(coil_variable, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_terminal_coil(ptr0, len0, program_index, contact_record_offset, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Restore the captured terminal MOVE after its retained contact.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_offset
 * @param {string} input_operand
 * @param {string} output_operand
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_terminal_move(bytes, program_index, contact_offset, input_operand, output_operand) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(input_operand, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(output_operand, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_terminal_move(ptr0, len0, program_index, contact_offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert a terminal TON with a declared instance and typed TIME operands.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} contact_offset
 * @param {string} instance
 * @param {string} preset
 * @param {string} elapsed
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_ld_terminal_timer(bytes, program_index, contact_offset, instance, preset, elapsed) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(instance, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(preset, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(elapsed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_ld_terminal_timer(ptr0, len0, program_index, contact_offset, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Insert an unallocated primitive IEC program-local symbol.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {string} name
 * @param {string} data_type
 * @param {string} description
 * @returns {Uint8Array}
 */
export function insert_xgwx_iec_local_symbol(bytes, program_index, name, data_type, description) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(data_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_iec_local_symbol(ptr0, len0, program_index, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Insert a native comparison contact at an XGK contact position.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} raw_y
 * @param {number} column
 * @param {string} mnemonic
 * @param {string} operands_json
 * @returns {Uint8Array}
 */
export function insert_xgwx_ladder_comparison(bytes, program_index, raw_y, column, mnemonic, operands_json) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(operands_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_ladder_comparison(ptr0, len0, program_index, raw_y, column, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert a catalog application instruction at an XGK output position.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} raw_y
 * @param {string} mnemonic
 * @param {string} operands_json
 * @returns {Uint8Array}
 */
export function insert_xgwx_ladder_instruction(bytes, program_index, raw_y, mnemonic, operands_json) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(operands_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_ladder_instruction(ptr0, len0, program_index, raw_y, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Insert a physical blank row before the selected row.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} raw_y
 * @returns {Uint8Array}
 */
export function insert_xgwx_ladder_row(bytes, program_index, raw_y) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_ladder_row(ptr0, len0, program_index, raw_y);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Insert a catalog module into an empty slot and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @param {string} model
 * @returns {Uint8Array}
 */
export function insert_xgwx_module(bytes, base, slot, model) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.insert_xgwx_module(ptr0, len0, base, slot, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Return category and description metadata for known ladder mnemonics.
 * @returns {any}
 */
export function known_ladder_mnemonics() {
    const ret = wasm.known_ladder_mnemonics();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Move one complete decoded IEC LD network into an empty row range.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} expected_first_row_index
 * @param {number} destination_first_row_index
 * @returns {Uint8Array}
 */
export function move_xgwx_iec_ld_group(bytes, program_index, group_index, expected_first_row_index, destination_first_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.move_xgwx_iec_ld_group(ptr0, len0, program_index, group_index, expected_first_row_index, destination_first_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Parse `.xgwx` bytes and return a browser-friendly JavaScript summary.
 * @param {Uint8Array} bytes
 * @returns {any}
 */
export function parse_xgwx(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.parse_xgwx(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Rename a captured IEC local symbol and its classified LD references.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} symbol_index
 * @param {string} expected_name
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function rename_xgwx_iec_local_symbol(bytes, program_index, symbol_index, expected_name, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.rename_xgwx_iec_local_symbol(ptr0, len0, program_index, symbol_index, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Reconnect the one-cell wire gap left by a captured IEC contact deletion.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} insertion_offset
 * @param {number} expected_raw_x
 * @returns {Uint8Array}
 */
export function repair_xgwx_iec_ld_horizontal_wire(bytes, program_index, insertion_offset, expected_raw_x) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.repair_xgwx_iec_ld_horizontal_wire(ptr0, len0, program_index, insertion_offset, expected_raw_x);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Replace a captured scalar branch function atomically, adjusting its footprint.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @param {string} function_name
 * @param {string} operands_json
 * @returns {Uint8Array}
 */
export function replace_xgwx_iec_ld_branch_function(bytes, program_index, block_offset, expected_name, function_name, operands_json) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(function_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(operands_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.replace_xgwx_iec_ld_branch_function(ptr0, len0, program_index, block_offset, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Replace an occupied IEC LD network with a copy of another in the program.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} source_group_index
 * @param {number} expected_source_first_row_index
 * @param {number} destination_group_index
 * @param {number} expected_destination_first_row_index
 * @returns {Uint8Array}
 */
export function replace_xgwx_iec_ld_group(bytes, program_index, source_group_index, expected_source_first_row_index, destination_group_index, expected_destination_first_row_index) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.replace_xgwx_iec_ld_group(ptr0, len0, program_index, source_group_index, expected_source_first_row_index, destination_group_index, expected_destination_first_row_index);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Replace a network from another IEC program, optionally copying its missing locals.
 * @param {Uint8Array} bytes
 * @param {number} source_program_index
 * @param {number} source_group_index
 * @param {number} expected_source_first_row_index
 * @param {number} destination_program_index
 * @param {number} destination_group_index
 * @param {number} expected_destination_first_row_index
 * @param {boolean} copy_missing_locals
 * @returns {Uint8Array}
 */
export function replace_xgwx_iec_ld_group_from_program(bytes, source_program_index, source_group_index, expected_source_first_row_index, destination_program_index, destination_group_index, expected_destination_first_row_index, copy_missing_locals) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.replace_xgwx_iec_ld_group_from_program(ptr0, len0, source_program_index, source_group_index, expected_source_first_row_index, destination_program_index, destination_group_index, expected_destination_first_row_index, copy_missing_locals);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Replace a supported scalar chain function atomically, adjusting its footprint.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} block_offset
 * @param {string} expected_name
 * @param {string} function_name
 * @param {string} operands_json
 * @returns {Uint8Array}
 */
export function replace_xgwx_iec_ld_scalar_chain_function(bytes, program_index, block_offset, expected_name, function_name, operands_json) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(function_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(operands_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.replace_xgwx_iec_ld_scalar_chain_function(ptr0, len0, program_index, block_offset, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Select the primary project configuration's CPU and return rewritten bytes.
 * @param {Uint8Array} bytes
 * @param {string} model
 * @returns {Uint8Array}
 */
export function select_xgwx_cpu(bytes, model) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.select_xgwx_cpu(ptr0, len0, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Select a catalog module and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @param {string} model
 * @returns {Uint8Array}
 */
export function select_xgwx_module(bytes, base, slot, model) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(model, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.select_xgwx_module(ptr0, len0, base, slot, ptr1, len1);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Set the physical slot count for an existing XGK base.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot_count
 * @returns {Uint8Array}
 */
export function set_xgwx_base_slot_count(bytes, base, slot_count) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.set_xgwx_base_slot_count(ptr0, len0, base, slot_count);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Update an XGI-D24A/B input filter and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @param {number} raw_filter
 * @returns {Uint8Array}
 */
export function set_xgwx_module_input_filter(bytes, base, slot, raw_filter) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.set_xgwx_module_input_filter(ptr0, len0, base, slot, raw_filter);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Set one verified module option and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @param {string} key
 * @param {number} index
 * @param {number} value
 * @returns {Uint8Array}
 */
export function set_xgwx_module_option(bytes, base, slot, key, index, value) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.set_xgwx_module_option(ptr0, len0, base, slot, ptr1, len1, index, value);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v3;
}

/**
 * Split disconnected IEC row ranges without changing coordinates or elements.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} group_index
 * @param {number} expected_upper_row
 * @param {number} expected_lower_row
 * @returns {Uint8Array}
 */
export function split_xgwx_iec_ld_group(bytes, program_index, group_index, expected_upper_row, expected_lower_row) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.split_xgwx_iec_ld_group(ptr0, len0, program_index, group_index, expected_upper_row, expected_lower_row);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Change a captured IEC ADD/SUB/MUL/DIV block kind.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_arithmetic_function(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_arithmetic_function(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Change a captured IEC coil among the six decoded coil kinds.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_coil_kind(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_coil_kind(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Replace one verified IEC LD comment with up to 255 UTF-16 units.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_comment(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_comment(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Change a captured IEC comparison block among EQ, GT, GE, LT, and LE.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_comparison_function(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_comparison_function(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Change a captured IEC contact among the six addressed IEC contact kinds.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_contact_kind(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_contact_kind(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Replace a verified IEC LD contact or output coil variable reference.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_element_operand(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_element_operand(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Replace a captured IEC LD function input/output expression.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_function_operand(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_function_operand(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Replace a verified IEC LD rising-edge contact variable reference.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_ld_rising_contact_operand(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_ld_rising_contact_operand(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Change a captured IEC program-local BOOL symbol's mapped address.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} symbol_index
 * @param {string} expected_name
 * @param {string} expected_address
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_local_symbol_address(bytes, program_index, symbol_index, expected_name, expected_address, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_local_symbol_address(ptr0, len0, program_index, symbol_index, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Change a captured IEC program-local symbol description.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} symbol_index
 * @param {string} expected_name
 * @param {string} expected_description
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_local_symbol_description(bytes, program_index, symbol_index, expected_name, expected_description, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_local_symbol_description(ptr0, len0, program_index, symbol_index, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Change a captured automatic IEC local variable's primitive type.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} symbol_index
 * @param {string} expected_name
 * @param {string} expected_type
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_iec_local_symbol_type(bytes, program_index, symbol_index, expected_name, expected_type, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(expected_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_iec_local_symbol_type(ptr0, len0, program_index, symbol_index, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
}

/**
 * Replace one same-length ladder cell string and return rewritten bytes.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {number} offset
 * @param {string} expected
 * @param {string} replacement
 * @returns {Uint8Array}
 */
export function update_xgwx_ladder_cell(bytes, program_index, offset, expected, replacement) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(expected, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(replacement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_ladder_cell(ptr0, len0, program_index, offset, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * Apply supported module attribute changes and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function update_xgwx_module(bytes, base, slot, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_module(ptr0, len0, base, slot, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply supported changes to one network and return rewritten bytes.
 * @param {Uint8Array} bytes
 * @param {number} network_index
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function update_xgwx_network(bytes, network_index, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_network(ptr0, len0, network_index, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply supported changes to one network-module metadata record.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function update_xgwx_network_module(bytes, base, slot, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_network_module(ptr0, len0, base, slot, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply supported program metadata changes and return rewritten `.xgwx` bytes.
 * @param {Uint8Array} bytes
 * @param {number} program_index
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function update_xgwx_program(bytes, program_index, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_program(ptr0, len0, program_index, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Apply supported changes to one global variable and return rewritten bytes.
 * @param {Uint8Array} bytes
 * @param {number} variable_index
 * @param {any} patch
 * @returns {Uint8Array}
 */
export function update_xgwx_variable(bytes, variable_index, patch) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.update_xgwx_variable(ptr0, len0, variable_index, patch);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

/**
 * Reparse the exact download bytes and verify a lossless round trip.
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function verify_xgwx_bytes(bytes) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verify_xgwx_bytes(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * Return the embedded latest-stable XGK module selection catalog.
 * @returns {any}
 */
export function xgk_module_catalog() {
    const ret = wasm.xgk_module_catalog();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Return the current values of all verified options for one module.
 * @param {Uint8Array} bytes
 * @param {number} base
 * @param {number} slot
 * @returns {any}
 */
export function xgwx_module_option_values(bytes, base, slot) {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.xgwx_module_option_values(ptr0, len0, base, slot);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_string_get_7ed5322991caaec5: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_6b64449b9b9ed33c: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_parse_1bbc9c053611d0a7: function() { return handleError(function (arg0, arg1) {
            const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_stringify_91082ed7a5a5769e: function() { return handleError(function (arg0) {
            const ret = JSON.stringify(arg0);
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./libxgwx_bg.js": import0,
    };
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('libxgwx_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
