import { AllObjectItem } from '@/pages/Home/types/allObjectItem';

// ifElseDefine 타입일 떄는 child를 초기화해야하기 때문에 다른 함수를 사용한다
export const refreshCodeFlow = (
  codeFlows: AllObjectItem[], //현제 코드흐름 시각화 정보를 담고 있는 리스트
  toAddObject: AllObjectItem //수정해야하는 정보를 담고 있는 객체
): AllObjectItem[] => {
  // 발견하고 반복문이 바로 끝나는 것이 아니라 계속 돌면서 남아있는 객체도 반환해야한다
  return codeFlows.map((codeFlow) => {
    // 맞는 id를 발견하면 들어가서 수정한다
    if (codeFlow.id === toAddObject.id) {
      // ifElseDefine 타입일 때는 child를 초기화한다
      return {
        ...codeFlow,
        ...toAddObject,
        type: codeFlow.type,
        child: [],
      };
    }
    // 끝까지 찾아도 없으면 child로 들어가서 재귀적으로 탐색한다
    else if (codeFlow.child && codeFlow.child.length > 0) {
      return {
        ...codeFlow,
        child: refreshCodeFlow(codeFlow.child, toAddObject),
      };
    }
    // 끝까지 찾아도 없으면 그냥 객체를 반환한다
    else {
      return codeFlow;
    }
  });
};