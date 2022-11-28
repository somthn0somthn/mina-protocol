import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
} from 'snarkyjs';

//field = unsigned integer
//SnarkyJs compatible data types => fields or types built on fields

//creates square sc w/ elem of state => num
export class Square extends SmartContract {
  @state(Field) num = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
    //num val set to 3
    this.num.set(Field(3));
  }

  //external callable
  @method update(square: Field) {
    const currentState = this.num.get();
    this.num.assertEquals(currentState);
    square.assertEquals(currentState.mul(currentState));
    //updates num val
    this.num.set(square);
  }
}
