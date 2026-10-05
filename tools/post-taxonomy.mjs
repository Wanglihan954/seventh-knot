// Categories describe one broad direction. Specific tasks belong in tags.
export function categoryForNote({ task = '', tags = [], collection = '' }) {
  if (collection === 'IR_VIS_Reg') return '跨视角与三维视觉';
  const classify = text => {
    if (/视频目标分割|\bVOS\b|\bMVOS\b|\bPVOS\b/i.test(text)) return '视频目标分割';
    if (/跨视角|视图合成|三维|3DGS|对应|配准|ego.exo/i.test(text)) return '跨视角与三维视觉';
    if (/跟踪|追踪|\btracking\b|\bSOT\b/i.test(text)) return '视觉目标跟踪';
    return null;
  };
  return classify(task) || classify(tags.join(' ')) || '视觉目标跟踪';
}
