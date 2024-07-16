import {
  useState,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import { PreprocessedCodesContext } from "../../Home";
import _ from "lodash";

// 타입 정의
import { CodeItem } from "@/types/codeItem";
import { AllObjectItem } from "@/types/allObjectItem";
import { ActivateItem } from "@/types/activateItem";
import { VariablesItem } from "@/types/variablesItem";
import { VariablesDto } from "@/types/dto/variablesDto";
import { ForDto } from "@/types/dto/forDto";
import { PrintDto } from "@/types/dto/printDto";
import { IfElseDto } from "@/types/dto/ifElseDto";

// services폴더에서 가져온 함수
import { addCodeFlow } from "./services/addCodeFlow";
import { updateCodeFlow } from "./services/updateCodeFlow";
import { turnLight } from "./services/turnLight";
import { createToAddObject } from "./services/createToAddObject";
import { updateDataStructure } from "./services/updateDataStructure";
import { updateActivate } from "./services/updateActivate";
import { turnOffAllLight } from "./services/turnOffAllLight";
//rendUtils에서 가져온 함수
import { renderingStructure } from "./renderingStructure";
import { renderingCodeFlow } from "./renderingCodeFLow";
import { IfElseChangeDto } from "@/types/dto/ifElseChangeDto";
import { refreshCodeFlow } from "./services/refreshCodeFlow";

interface State {
  objects: AllObjectItem[];
}
const backForwardNavReducer = (state: any, action: any) => {
  switch (action.type) {
    case "forward":
      return state + 1;
    case "back":
      return state - 1;
    default:
      return state;
  }
};

const RightSection = () => {
  const [idx, navControlDispatch] = useReducer(backForwardNavReducer, -1);
  const [codeFlowList, setCodeFlowList] = useState<State[]>([
    {
      objects: [{ id: 0, type: "start", depth: 0, isLight: false, child: [] }],
    },
  ]);
  const [StructuresList, setStructuresList] = useState<CodeItem[][]>([[]]); // 변수 데이터 시각화 리스트의 변화과정을 담아두는 리스트
  const context = useContext(PreprocessedCodesContext); // context API로 데이터 가져오기
  if (!context) {
    throw new Error("CodeContext not found"); //context가 없을 경우 에러 출력 패턴 처리안해주면 에러 발생
  }
  const { preprocessedCodes } = context;

  // codeFlowList를 업데이트하는 useEffect
  useEffect(() => {
    let trackingId: number = 0;
    let activate: ActivateItem[] = [];
    const usedId: number[] = [];
    const usedName: string[] = [];

    let accCodeFlow: State = {
      objects: [{ id: 0, type: "start", depth: 0, isLight: false, child: [] }],
    };
    let accDataStructures: CodeItem[] = [];
    const accCodeFlowList: State[] = [];
    const accDataStructuresList: CodeItem[][] = [];

    for (let preprocessedCode of preprocessedCodes) {
      let changedCodeFlows: AllObjectItem[] = [];

      // 자료구조 시각화 부분이 들어왔을 때
      if (preprocessedCode.type.toLowerCase() === "assignViz".toLowerCase()) {
        (preprocessedCode as VariablesDto).variables.forEach(
          (variable: VariablesItem) => {
            // 이미 한번 자료구조 시각화에 표현된 name인 경우
            if (usedName.includes(variable.name!)) {
              const targetName = variable.name!;

              accDataStructures = updateDataStructure(
                targetName,
                accDataStructures,
                variable
              );
            }
            // 처음 시각화해주는 자료구조인 경우
            else {
              accDataStructures.push(variable as CodeItem);
              usedName.push(variable.name!);
            }
          }
        );
      }
      // 코드 시각화 부분이 들어왔을 때
      else {
        // ifelseDefine 타입
        if (preprocessedCode.type === "ifElseDefine") {
          // ifelse만 한번에 다 끄고 한번에 다 킨다
          const turnoff = turnOffAllLight(accCodeFlow.objects);
          accCodeFlow = { objects: turnoff };
          for (let condition of (preprocessedCode as IfElseDto).conditions) {
            // ifelse 타입의 객체에 depth를 추가해주는 부분
            const ifElseItem = Object.assign(condition, {
              depth: (preprocessedCode as IfElseDto).depth,
            });
            // ifelse 타입의 객체를 만들어주는 함수
            const toAddObject = createToAddObject(ifElseItem);

            // isLight를 true로 바꿔준다
            toAddObject.isLight = true;
            let finallyCodeFlow: any;
            if (usedId.includes(toAddObject.id)) {
              // child부분을 초기화 해주는 함수
              finallyCodeFlow = refreshCodeFlow(
                accCodeFlow.objects,
                toAddObject
              );
            } else {
              usedId.push(toAddObject.id);

              finallyCodeFlow = addCodeFlow(
                accCodeFlow.objects,
                toAddObject,
                trackingId
              );
            }

            accCodeFlow = { objects: finallyCodeFlow };
          }
        }
        //그밖의 타입
        else {
          const toAddObject = createToAddObject(
            preprocessedCode as ForDto | PrintDto | IfElseChangeDto
          );

          // 한번 codeFlow list에 들어가서 수정하는 입력일 때
          if (usedId.includes(toAddObject.id!)) {
            changedCodeFlows = updateCodeFlow(accCodeFlow.objects, toAddObject);
          }
          // 처음 codeFlow list에 들어가서 더해야하는 입력일 때
          else {
            usedId.push(toAddObject.id);
            changedCodeFlows = addCodeFlow(
              accCodeFlow.objects,
              toAddObject,
              trackingId
            );
          }
          activate = updateActivate(activate, toAddObject);
          const finallyCodeFlow = turnLight(changedCodeFlows, activate);
          accCodeFlow = { objects: finallyCodeFlow };
          trackingId = toAddObject.id;
        }
      }
      // 불을 켜줘야하는 자료구조의의 name을 담는 배열
      let toLightStructures: any;
      if ((preprocessedCode as VariablesDto).variables === undefined) {
        toLightStructures = [];
      } else {
        toLightStructures = (preprocessedCode as VariablesDto).variables?.map(
          (element) => {
            return element.name;
          }
        );
      }

      // toLightStructures 를 참고해서 데이터 구조 시각화 데이터 속성 중 isLight가 true인지 false인지 판단해주는 부분
      accDataStructures = accDataStructures.map((structure) => ({
        ...structure,
        isLight: toLightStructures?.includes(structure.name), // toLightStructures 에 자료구조 name이 있으면 isLight를 true로 바꿔준다
      }));

      // 얕은 복사 문제가 생겨서 깊은 복사를 해준다
      const deepCloneStructures = _.cloneDeep(accDataStructures);
      accDataStructuresList.push(deepCloneStructures);
      accCodeFlowList.push(accCodeFlow);
    }

    setCodeFlowList(accCodeFlowList);
    setStructuresList(accDataStructuresList);
  }, [preprocessedCodes]);

  const onForward = useCallback(() => {
    if (idx < codeFlowList.length - 1) {
      navControlDispatch({ type: "forward" });
    }
  }, [idx, codeFlowList.length]);

  const onBack = useCallback(() => {
    if (idx >= 0) {
      navControlDispatch({ type: "back" });
    }
  }, [idx]);

  return (
    <div style={{ backgroundColor: "#f4f4f4", width: "100%" }}>
      <button onClick={onBack}>뒤로 가기</button>
      <button onClick={onForward}>앞으로 가기</button>
      <div>
        <ul style={{ display: "flex" }}>
          {StructuresList?.length > 0 &&
            idx >= 0 &&
            renderingStructure(StructuresList[idx])}
        </ul>
      </div>
      <ul>
        {codeFlowList?.length > 0 &&
          idx >= 0 &&
          renderingCodeFlow(codeFlowList[idx].objects[0].child)}
      </ul>
    </div>
  );
};

export default RightSection;
