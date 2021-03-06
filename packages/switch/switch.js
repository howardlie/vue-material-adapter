import { MDCSwitchFoundation } from '@material/switch/foundation';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  toRefs,
  watch,
  toRef,
} from '@vue/composition-api';
import { useRipplePlugin } from '~/ripple/ripple-plugin.js';

let switchId_ = 0;

export default {
  name: 'mcw-switch',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
    disabled: Boolean,
    value: String,
    label: String,
    alignEnd: Boolean,
    name: String,
    id: String,
  },

  setup(props, { slots, emit }) {
    const uiState = reactive({
      classes: { 'mdc-switch': 1 },
      nativeControlChecked: props.checked,
      nativeControlDisabled: props.disabled,
      nativeAttrs: {},
      root: null,
    });

    const { classes: rippleClasses, styles } = useRipplePlugin(
      toRef(uiState, 'root'),
    );

    let foundation;
    const switchId = props.id ?? `__mcw-switch-${switchId_++}`;

    const classes = computed(() => {
      return { ...rippleClasses.value, ...uiState.classes };
    });

    const hasLabel = computed(() => {
      return props.label || slots.default;
    });

    const onChanged = event => {
      foundation?.handleChange(event);
      emit('change', event.target.checked);
    };

    const adapter = {
      addClass: className =>
        (uiState.classes = { ...uiState.classes, [className]: true }),
      removeClass: className => {
        // eslint-disable-next-line no-unused-vars
        const { [className]: removed, ...rest } = uiState.classes;
        uiState.classes = rest;
      },
      setNativeControlChecked: checked =>
        (uiState.nativeControlChecked = checked),
      setNativeControlDisabled: disabled =>
        (uiState.nativeControlDisabled = disabled),

      setNativeControlAttr: (attr, value) => {
        uiState.nativeAttrs[attr] = value;
      },
    };

    watch(
      () => props.checked,
      (nv, ov) => {
        nv != ov && foundation?.setChecked(nv);
      },
    );

    watch(
      () => props.disabled,
      (nv, ov) => {
        nv != ov && foundation?.setDisabled(nv);
      },
    );

    onMounted(() => {
      foundation = new MDCSwitchFoundation(adapter);

      foundation.init();
      foundation.setChecked(props.checked);
      foundation.setDisabled(props.disabled);
    });

    onBeforeUnmount(() => {
      foundation.destroy();
    });

    return {
      ...toRefs(uiState),
      classes,
      hasLabel,
      onChanged,
      styles,
      switchId,
    };
  },
};
